import bear from "../asset/熊好.png";
import monkey from "../asset/猴專心.png";
import flyingSquirrel from "../asset/鼯睏.png";
import tiger from "../asset/虎省.png";
import pangolin from "../asset/甲油.png";
import deer from "../asset/鹿順.png";
import magpie from "../asset/鵲定.png";
import owl from "../asset/眉問題.png";
import frog from "../asset/蛙心.png";
import pheasant from "../asset/雉道.png";

export type Mascot = {
  name: string;
  animal: string;
  food: string;
  image: string;
  personality: string;
  feature: string;
  message: string;
  pages: string[];
};

export const mascots: Mascot[] = [
  { name: "熊好", animal: "台灣黑熊", food: "🌰 堅果", image: bear, personality: "看似慢吞吞，其實很會找路", feature: "今日總覽・任務管理", message: "任務太多時會爬到樹上看整天行程：『今天路有點滿喔。』", pages: ["今天", "任務", "計畫"] },
  { name: "猴專心", animal: "台灣獼猴", food: "🍌 香蕉", image: monkey, personality: "超容易被新東西吸引，但進入狀態後很有動力", feature: "番茄鐘・專注", message: "開始專注前先摸西摸：『猴專心啦！』", pages: ["專注"] },
  { name: "鼯睏", animal: "台灣小鼯鼠", food: "🍃 嫩葉", image: flyingSquirrel, personality: "白天常想睡，晚上突然很精神", feature: "睡眠・精力管理", message: "白天抱枕頭打哈欠；晚上精神爆棚，提醒別熬夜。", pages: ["健康"] },
  { name: "虎省", animal: "石虎", food: "🐭 小鼠", image: tiger, personality: "很謹慎，花每一筆錢都會觀察很久", feature: "記帳・預算", message: "看到大額消費會躲在草叢探頭：『這筆真的要嗎？』", pages: ["財務"] },
  { name: "甲油", animal: "穿山甲", food: "🐜 螞蟻", image: pangolin, personality: "慢慢做、不躁進，但非常有毅力", feature: "專案・工作進度", message: "每完成一步就往前挖一點；壓力過大時捲縮成球。", pages: ["專案", "工作"] },
  { name: "鹿順", animal: "台灣梅花鹿", food: "🌿 青草", image: deer, personality: "溫柔，有自己的生活節奏", feature: "習慣養成", message: "每完成一次習慣，就沿著草上的小路往前走一步。", pages: ["習慣"] },
  { name: "鵲定", animal: "台灣藍鵲", food: "🍒 漿果", image: magpie, personality: "超愛管大家，任何事都要確認", feature: "行程・提醒", message: "行程有衝突時飛來通知：『等一下，這兩個撞到了！』", pages: ["行事曆"] },
  { name: "眉問題", animal: "冠羽畫眉", food: "🐛 小蟲", image: owl, personality: "好奇、話很多，看到什麼都想研究", feature: "學習・考試", message: "讀書時頭頂冠羽越來越翹：『這題先弄懂再走！』", pages: ["學習", "考試"] },
  { name: "蛙心", animal: "莫氏樹蛙", food: "🦟 小飛蟲", image: frog, personality: "平常安靜，但很會表達情緒", feature: "心情・日記", message: "情緒低落時縮在葉子下；心情好時就在葉子探頭唱歌。", pages: ["日記", "心情"] },
  { name: "雉道", animal: "帝雉", food: "🌰 種子", image: pheasant, personality: "安靜，觀察很久才講話", feature: "AI 分析・智慧建議", message: "平常不吵你，需要分析時才慢慢走出森林給你一句建議。", pages: ["成長報告", "洞察"] },
];

export function mascotForPage(page: string) {
  return mascots.find((mascot) => mascot.pages.some((name) => page.includes(name))) ?? mascots[0];
}
