'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMbtiByCode, getMbtiDescription, type MbtiType } from '@/lib/mbti-data';
import { ArrowLeft, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  optionA: { text: string; value: string };
  optionB: { text: string; value: string };
}

const questions: Question[] = [
  // E/I 维度
  {
    id: 1,
    text: '在社交活动中，你通常：',
    dimension: 'EI',
    optionA: { text: '精力充沛，喜欢认识新朋友', value: 'E' },
    optionB: { text: '感到消耗，更喜欢和熟人相处', value: 'I' },
  },
  {
    id: 2,
    text: '周末你更倾向于：',
    dimension: 'EI',
    optionA: { text: '参加聚会或社交活动', value: 'E' },
    optionB: { text: '在家独处或和少数朋友相处', value: 'I' },
  },
  {
    id: 3,
    text: '在团队中，你通常：',
    dimension: 'EI',
    optionA: { text: '主动发言，带动气氛', value: 'E' },
    optionB: { text: '先倾听，再选择性发言', value: 'I' },
  },
  // S/N 维度
  {
    id: 4,
    text: '你更关注：',
    dimension: 'SN',
    optionA: { text: '具体的事实和细节', value: 'S' },
    optionB: { text: '可能性和整体模式', value: 'N' },
  },
  {
    id: 5,
    text: '学习新事物时，你更喜欢：',
    dimension: 'SN',
    optionA: { text: '按照实际步骤操作', value: 'S' },
    optionB: { text: '先理解概念和原理', value: 'N' },
  },
  {
    id: 6,
    text: '描述未来时，你更倾向于：',
    dimension: 'SN',
    optionA: { text: '基于现实经验的预测', value: 'S' },
    optionB: { text: '想象各种可能性', value: 'N' },
  },
  // T/F 维度
  {
    id: 7,
    text: '做决策时，你更依赖：',
    dimension: 'TF',
    optionA: { text: '逻辑分析和客观标准', value: 'T' },
    optionB: { text: '个人价值观和他人感受', value: 'F' },
  },
  {
    id: 8,
    text: '朋友遇到困难时，你会：',
    dimension: 'TF',
    optionA: { text: '帮助分析问题并提供解决方案', value: 'T' },
    optionB: { text: '先给予情感支持和安慰', value: 'F' },
  },
  {
    id: 9,
    text: '评价一个方案时，你更看重：',
    dimension: 'TF',
    optionA: { text: '效率和结果', value: 'T' },
    optionB: { text: '对人们的影响', value: 'F' },
  },
  // J/P 维度
  {
    id: 10,
    text: '你的生活方式更倾向于：',
    dimension: 'JP',
    optionA: { text: '有计划、有条理', value: 'J' },
    optionB: { text: '灵活、随性', value: 'P' },
  },
  {
    id: 11,
    text: '面对截止日期，你通常：',
    dimension: 'JP',
    optionA: { text: '提前完成，避免压力', value: 'J' },
    optionB: { text: '在最后期限前冲刺', value: 'P' },
  },
  {
    id: 12,
    text: '旅行时，你更喜欢：',
    dimension: 'JP',
    optionA: { text: '提前规划好行程', value: 'J' },
    optionB: { text: '随机应变，说走就走', value: 'P' },
  },
];

export default function MbtiTestPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));

    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
    } else {
      setTimeout(() => setShowResult(true), 300);
    }
  };

  const calculateResult = () => {
    const counts: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

    questions.forEach((q) => {
      const answer = answers[q.id];
      if (answer) {
        counts[answer]++;
      }
    });

    const result =
      (counts.E >= counts.I ? 'E' : 'I') +
      (counts.S >= counts.N ? 'S' : 'N') +
      (counts.T >= counts.F ? 'T' : 'F') +
      (counts.J >= counts.P ? 'J' : 'P');

    return result;
  };

  const saveResult = async () => {
    const mbtiType = calculateResult();
    setSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mbtiType }),
      });
      if (res.ok) {
        router.push('/me');
      }
    } catch (error) {
      console.error('Save MBTI result error:', error);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResult(false);
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (showResult) {
    const result = calculateResult() as MbtiType;
    const mbtiInfo = getMbtiByCode(result);
    const description = getMbtiDescription(result);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <Sparkles className="w-12 h-12 text-violet-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">测试完成！</h1>
            <p className="text-gray-500 mb-8">你的 MBTI 类型是</p>

            <div
              className="inline-block px-8 py-4 rounded-2xl mb-6"
              style={{ backgroundColor: mbtiInfo?.color || '#7c3aed' }}
            >
              <span className="text-4xl font-bold text-white">{result}</span>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {mbtiInfo?.name || '未知类型'}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{description}</p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={saveResult}
                disabled={saving}
                className="px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存到我的资料'}
              </button>
              <button
                onClick={reset}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                重新测试
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">MBTI 性格测试</h1>
          <div className="w-9" />
        </div>

        {/* 进度条 */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>问题 {currentIndex + 1} / {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 问题卡片 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
              {currentQuestion.dimension === 'EI' && '能量来源'}
              {currentQuestion.dimension === 'SN' && '信息获取'}
              {currentQuestion.dimension === 'TF' && '决策方式'}
              {currentQuestion.dimension === 'JP' && '生活方式'}
            </span>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-8">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3">
            <button
              onClick={() => handleAnswer(currentQuestion.optionA.value)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                answers[currentQuestion.id] === currentQuestion.optionA.value
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    answers[currentQuestion.id] === currentQuestion.optionA.value
                      ? 'border-violet-500'
                      : 'border-gray-300'
                  }`}
                >
                  {answers[currentQuestion.id] === currentQuestion.optionA.value && (
                    <div className="w-2.5 h-2.5 bg-violet-500 rounded-full" />
                  )}
                </div>
                <span className="text-gray-700 font-medium">{currentQuestion.optionA.text}</span>
              </div>
            </button>

            <button
              onClick={() => handleAnswer(currentQuestion.optionB.value)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                answers[currentQuestion.id] === currentQuestion.optionB.value
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    answers[currentQuestion.id] === currentQuestion.optionB.value
                      ? 'border-violet-500'
                      : 'border-gray-300'
                  }`}
                >
                  {answers[currentQuestion.id] === currentQuestion.optionB.value && (
                    <div className="w-2.5 h-2.5 bg-violet-500 rounded-full" />
                  )}
                </div>
                <span className="text-gray-700 font-medium">{currentQuestion.optionB.text}</span>
              </div>
            </button>
          </div>

          {/* 上一步 */}
          {currentIndex > 0 && (
            <button
              onClick={goBack}
              className="mt-6 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              上一题
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
