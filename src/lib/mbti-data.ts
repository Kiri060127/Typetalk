export type MbtiType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export type MbtiCategory = 'analyst' | 'diplomat' | 'sentinel' | 'explorer';

export const mbtiTypes: MbtiType[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

export interface MbtiTypeInfo {
  code: string;
  name: string;
  color: string;
  gradient: string;
}

export const MBTI_TYPES: MbtiTypeInfo[] = [
  { code: 'INTJ', name: '战略家', color: '#4c1d95', gradient: 'from-violet-900 to-purple-800' },
  { code: 'INTP', name: '逻辑学家', color: '#5b21b6', gradient: 'from-violet-800 to-purple-700' },
  { code: 'ENTJ', name: '指挥官', color: '#6d28d9', gradient: 'from-violet-700 to-purple-600' },
  { code: 'ENTP', name: '辩论家', color: '#7c3aed', gradient: 'from-violet-600 to-purple-500' },
  { code: 'INFJ', name: '提倡者', color: '#1e40af', gradient: 'from-blue-900 to-blue-700' },
  { code: 'INFP', name: '调停者', color: '#1d4ed8', gradient: 'from-blue-800 to-blue-600' },
  { code: 'ENFJ', name: '主人公', color: '#2563eb', gradient: 'from-blue-700 to-blue-500' },
  { code: 'ENFP', name: '追梦人', color: '#3b82f6', gradient: 'from-blue-600 to-blue-400' },
  { code: 'ISTJ', name: '检查者', color: '#065f46', gradient: 'from-emerald-900 to-emerald-700' },
  { code: 'ISFJ', name: '守护者', color: '#047857', gradient: 'from-emerald-800 to-emerald-600' },
  { code: 'ESTJ', name: '总经理', color: '#059669', gradient: 'from-emerald-700 to-emerald-500' },
  { code: 'ESFJ', name: '执政官', color: '#10b981', gradient: 'from-emerald-600 to-emerald-400' },
  { code: 'ISTP', name: '鉴赏家', color: '#92400e', gradient: 'from-amber-900 to-amber-700' },
  { code: 'ISFP', name: '探险家', color: '#b45309', gradient: 'from-amber-800 to-amber-600' },
  { code: 'ESTP', name: '企业家', color: '#d97706', gradient: 'from-amber-700 to-amber-500' },
  { code: 'ESFP', name: '表演者', color: '#f59e0b', gradient: 'from-amber-600 to-amber-400' },
];

export function getMbtiByCode(code: string): MbtiTypeInfo | undefined {
  return MBTI_TYPES.find((type) => type.code === code);
}

export function getMbtiCategory(type: MbtiType): MbtiCategory {
  const firstLetter = type[0];
  const secondLetter = type[1];

  if (firstLetter === 'N' && (secondLetter === 'T' || type === 'INTJ' || type === 'ENTJ')) {
    return 'analyst';
  }
  if (firstLetter === 'N' && (secondLetter === 'F' || type === 'INFJ' || type === 'ENFJ')) {
    return 'diplomat';
  }
  if (firstLetter === 'S' && (secondLetter === 'J' || type === 'ISTJ' || type === 'ESTJ')) {
    return 'sentinel';
  }
  return 'explorer';
}

export function getCategoryColor(category: MbtiCategory): string {
  const colors: Record<MbtiCategory, string> = {
    analyst: 'bg-mbti-analyst text-white',
    diplomat: 'bg-mbti-diplomat text-white',
    sentinel: 'bg-mbti-sentinel text-white',
    explorer: 'bg-mbti-explorer text-white',
  };
  return colors[category];
}

export function getMbtiColor(type: MbtiType): string {
  return getCategoryColor(getMbtiCategory(type));
}

export function getMbtiDescription(type: MbtiType): string {
  const descriptions: Record<MbtiType, string> = {
    INTJ: '建筑师 - 富有想象力和战略性的思想家',
    INTP: '逻辑学家 - 具有创造力的发明家',
    ENTJ: '指挥官 - 大胆、富有想象力且意志坚强的领导者',
    ENTP: '辩论家 - 聪明好奇的思想者',
    INFJ: '提倡者 - 安静而神秘，鼓舞人心的理想主义者',
    INFP: '调停者 - 善良、关怀的利他主义者',
    ENFJ: '主人公 - 富有魅力、鼓舞人心的领导者',
    ENFP: '竞选者 - 热情、有创造力的自由精神者',
    ISTJ: '物流师 - 实际且注重事实的个人',
    ISFJ: '守卫者 - 非常专注和热情的保护者',
    ESTJ: '总经理 - 出色的管理者',
    ESFJ: '执政官 - 极其关心他人的合作者',
    ISTP: '鉴赏家 - 大胆而实际的实验家',
    ISFP: '探险家 - 灵活有魅力的艺术家',
    ESTP: '企业家 - 聪明、精力充沛的感知者',
    ESFP: '表演者 - 自发的、精力充沛的娱乐者',
  };
  return descriptions[type];
}
