export type Entry = { day:number; mood:number|null; work:number|null; headline:string; summary:string; tags:string[]; text:string }
export const TODAY=1
export const YEAR=2026
export const MONTH=0
export const MOODS=[
  {score:1,label:'低落',color:'#8e9ad8'},
  {score:2,label:'有点累',color:'#7fbfd2'},
  {score:3,label:'平静',color:'#9fd0a8'},
  {score:4,label:'轻松',color:'#f4c36e'},
  {score:5,label:'明亮',color:'#f08a9d'},
]
export const moodOf=(score:number|null)=>MOODS.find(m=>m.score===score)
export const entries:Record<number,Entry>={}
export const weekdayLabel=['日','一','二','三','四','五','六']
export const dayOfWeek=(day:number)=>new Date(YEAR,MONTH,day).getDay()
