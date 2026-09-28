export const FEEDBACK_LABELS = ["correct","wrong_action","wrong_priority","missing_context"] as const;
export type FeedbackLabel=(typeof FEEDBACK_LABELS)[number];
export type AgentDecision=Readonly<{action:string;confidence:number;reasoning:string;decidedAt:string;model:string}>;
export type HumanFeedback=Readonly<{label:FeedbackLabel;note?:string;actorId:string;createdAt:string}>;
export type EvaluatedDecision=Readonly<{id:string;decision:AgentDecision;feedback?:HumanFeedback}>;
export type EvaluationRow=Readonly<{decisionId:string;modelAction:string;confidence:number;feedback:FeedbackLabel;note:string}>;
const MAX_NOTE_LENGTH=500;
const EMAIL=/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE=/(?:\+?\d[\d\s().-]{7,}\d)/g;
const URL=/\bhttps?:\/\/[^\s]+/gi;
export function scrubFeedbackNote(input:string):string{return input.slice(0,MAX_NOTE_LENGTH).replace(EMAIL,"[EMAIL]").replace(PHONE,"[PHONE]").replace(URL,"[URL]").trim()}
export function isFeedbackLabel(value:unknown):value is FeedbackLabel{return typeof value==="string"&&(FEEDBACK_LABELS as readonly string[]).includes(value)}
export function attachHumanFeedback(item:EvaluatedDecision,input:{label:unknown;note?:unknown;actorId:string;now?:Date}):EvaluatedDecision{
 if(!isFeedbackLabel(input.label))throw new Error("Invalid feedback label");
 const actorId=input.actorId.trim(); if(!actorId)throw new Error("actorId is required");
 const note=typeof input.note==="string"?scrubFeedbackNote(input.note):undefined;
 return {...item,feedback:{label:input.label,...(note?{note}:{}),actorId,createdAt:(input.now??new Date()).toISOString()}};
}
export function buildEvaluationDataset(items:readonly EvaluatedDecision[]):EvaluationRow[]{
 return items.flatMap(item=>!item.feedback?[]:[{decisionId:item.id,modelAction:item.decision.action,confidence:item.decision.confidence,feedback:item.feedback.label,note:item.feedback.note??""}]);
}
export function evaluateAgent(rows:readonly EvaluationRow[]){
 const byLabel:Record<FeedbackLabel,number>={correct:0,wrong_action:0,wrong_priority:0,missing_context:0};
 for(const row of rows)byLabel[row.feedback]+=1;
 const total=rows.length;if(!total)return{total:0,agreementRate:null,disagreementRate:null,byLabel};
 return{total,agreementRate:byLabel.correct/total,disagreementRate:(total-byLabel.correct)/total,byLabel};
}
