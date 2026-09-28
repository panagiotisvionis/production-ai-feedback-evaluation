import {describe,expect,it} from "vitest";
import {attachHumanFeedback,buildEvaluationDataset,evaluateAgent,scrubFeedbackNote,type EvaluatedDecision} from "../src/agent-feedback.js";
const decision:EvaluatedDecision={id:"case-42",decision:{action:"request_more_information",confidence:.82,reasoning:"Required order information is missing.",decidedAt:"2026-09-28T10:00:00.000Z",model:"example-model"}};
describe("feedback boundary",()=>{
 it("never changes the original decision",()=>{const original=structuredClone(decision);const result=attachHumanFeedback(decision,{label:"wrong_action",actorId:"reviewer-1",now:new Date("2026-09-28T11:00:00Z")});expect(decision).toEqual(original);expect(result.decision).toBe(decision.decision)});
 it("rejects unknown labels",()=>expect(()=>attachHumanFeedback(decision,{label:"rewrite",actorId:"reviewer-1"})).toThrow("Invalid feedback label"));
 it("requires an actor",()=>expect(()=>attachHumanFeedback(decision,{label:"correct",actorId:" " })).toThrow("actorId is required"));
 it("redacts common PII",()=>expect(scrubFeedbackNote("Email jane@example.com, call +1 212 555 1234, see https://example.com/private")).toBe("Email [EMAIL], call [PHONE], see [URL]"));
 it("bounds notes",()=>expect(scrubFeedbackNote("x".repeat(700))).toHaveLength(500));
 it("exports a narrow schema",()=>{const x=attachHumanFeedback(decision,{label:"correct",note:"Appropriate.",actorId:"reviewer-1"});expect(buildEvaluationDataset([x])[0]).toEqual({decisionId:"case-42",modelAction:"request_more_information",confidence:.82,feedback:"correct",note:"Appropriate."})});
});
describe("evaluation",()=>it("measures agreement",()=>expect(evaluateAgent([{decisionId:"1",modelAction:"reply",confidence:.9,feedback:"correct",note:""},{decisionId:"2",modelAction:"escalate",confidence:.7,feedback:"wrong_action",note:""}])).toMatchObject({total:2,agreementRate:.5,disagreementRate:.5})));
