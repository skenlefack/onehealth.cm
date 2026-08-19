'use client';

import { useState, useCallback } from 'react';
import { Check, X, RotateCcw, ChevronUp, ChevronDown, ArrowRight, Lightbulb, Trophy, RefreshCw } from 'lucide-react';

type Language = 'fr' | 'en';

// --- JSON Schema Types ---

interface FlashcardConfig {
  cards: { front: string; back: string }[];
}

interface MatchingConfig {
  pairs: { left: string; right: string }[];
}

interface MCQCardConfig {
  question: string;
  options: { text: string; is_correct: boolean; explanation?: string }[];
}

interface OrderingConfig {
  items: { text: string }[];
  correct_order: number[];
}

interface FillGapsConfig {
  text: string;
  blanks: { answer: string; hint?: string }[];
}

interface InteractiveBlock {
  id: string;
  type: 'flashcards' | 'matching' | 'mcq_cards' | 'ordering' | 'fill_gaps';
  title?: string;
  config: FlashcardConfig | MatchingConfig | MCQCardConfig | OrderingConfig | FillGapsConfig;
}

interface InteractiveContentConfig {
  blocks: InteractiveBlock[];
}

interface InteractiveContentRendererProps {
  config: InteractiveContentConfig;
  lang?: Language;
}

// --- Main Renderer ---

export function InteractiveContentRenderer({ config, lang = 'fr' }: InteractiveContentRendererProps) {
  if (!config?.blocks?.length) return null;

  return (
    <div className="space-y-8">
      {config.blocks.map((block) => (
        <div key={block.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {block.title && (
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h3 className="text-lg font-semibold text-white">{block.title}</h3>
            </div>
          )}
          <div className="p-6">
            {block.type === 'flashcards' && <FlashcardBlock config={block.config as FlashcardConfig} lang={lang} />}
            {block.type === 'matching' && <MatchingBlock config={block.config as MatchingConfig} lang={lang} />}
            {block.type === 'mcq_cards' && <MCQCardBlock config={block.config as MCQCardConfig} lang={lang} />}
            {block.type === 'ordering' && <OrderingBlock config={block.config as OrderingConfig} lang={lang} />}
            {block.type === 'fill_gaps' && <FillGapsBlock config={block.config as FillGapsConfig} lang={lang} />}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Flashcard Block ---

function FlashcardBlock({ config, lang }: { config: FlashcardConfig; lang: Language }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [reviewCards, setReviewCards] = useState<Set<number>>(new Set());

  const card = config.cards[currentIdx];
  if (!card) return null;

  const total = config.cards.length;
  const reviewed = knownCards.size + reviewCards.size;
  const allDone = reviewed === total;

  const t = {
    iKnew: lang === 'fr' ? 'Je savais' : 'I knew it',
    needReview: lang === 'fr' ? 'À revoir' : 'Need review',
    clickToFlip: lang === 'fr' ? 'Cliquez pour retourner' : 'Click to flip',
    progress: lang === 'fr' ? `${reviewed}/${total} cartes revues` : `${reviewed}/${total} cards reviewed`,
    congrats: lang === 'fr' ? 'Bravo ! Toutes les cartes ont été revues.' : 'Congrats! All cards reviewed.',
    knewCount: lang === 'fr' ? `${knownCards.size} maîtrisées` : `${knownCards.size} mastered`,
    reviewCount: lang === 'fr' ? `${reviewCards.size} à revoir` : `${reviewCards.size} to review`,
    restart: lang === 'fr' ? 'Recommencer' : 'Restart',
  };

  const goNext = (known: boolean) => {
    if (known) {
      setKnownCards(prev => new Set([...prev, currentIdx]));
    } else {
      setReviewCards(prev => new Set([...prev, currentIdx]));
    }
    setIsFlipped(false);
    if (currentIdx < total - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const restart = () => {
    setCurrentIdx(0);
    setIsFlipped(false);
    setKnownCards(new Set());
    setReviewCards(new Set());
  };

  if (allDone) {
    return (
      <div className="text-center py-8">
        <Trophy size={48} className="mx-auto text-amber-500 mb-4" />
        <p className="text-lg font-semibold text-slate-800 mb-2">{t.congrats}</p>
        <div className="flex justify-center gap-4 mb-6">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">{t.knewCount}</span>
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">{t.reviewCount}</span>
        </div>
        <button onClick={restart} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto">
          <RefreshCw size={16} /> {t.restart}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-500">{t.progress}</span>
        <div className="flex gap-1">
          {config.cards.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                knownCards.has(i) ? 'bg-emerald-500' : reviewCards.has(i) ? 'bg-amber-500' : i === currentIdx ? 'bg-blue-500' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="cursor-pointer select-none"
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
            minHeight: '200px',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-center">
              <p className="text-xl font-semibold text-slate-800">{card.front}</p>
              <p className="text-xs text-slate-400 mt-4">{t.clickToFlip}</p>
            </div>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-xl font-semibold text-slate-800">{card.back}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {isFlipped && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => goNext(false)}
            className="flex items-center gap-2 px-6 py-3 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors font-medium"
          >
            <RotateCcw size={18} /> {t.needReview}
          </button>
          <button
            onClick={() => goNext(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors font-medium"
          >
            <Check size={18} /> {t.iKnew}
          </button>
        </div>
      )}
    </div>
  );
}

// --- Matching Block ---

function MatchingBlock({ config, lang }: { config: MatchingConfig; lang: Language }) {
  const [matches, setMatches] = useState<Record<number, number | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [shuffledRight, setShuffledRight] = useState<number[]>(() => {
    const indices = config.pairs.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  });

  const t = {
    check: lang === 'fr' ? 'Vérifier' : 'Check',
    correct: lang === 'fr' ? 'Correct !' : 'Correct!',
    incorrect: lang === 'fr' ? 'Incorrect' : 'Incorrect',
    select: lang === 'fr' ? 'Sélectionner...' : 'Select...',
    score: (c: number, t: number) => lang === 'fr' ? `${c}/${t} correct${c > 1 ? 's' : ''}` : `${c}/${t} correct`,
    retry: lang === 'fr' ? 'Réessayer' : 'Try again',
    perfect: lang === 'fr' ? 'Parfait !' : 'Perfect!',
  };

  const handleCheck = () => setSubmitted(true);

  const handleRetry = () => {
    setMatches({});
    setSubmitted(false);
    const indices = config.pairs.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledRight(indices);
  };

  const correctCount = submitted
    ? config.pairs.filter((_, i) => matches[i] === i).length
    : 0;
  const allCorrect = correctCount === config.pairs.length;

  // Check which right options are already used
  const usedRight = new Set(Object.values(matches).filter(v => v !== null && v !== undefined));

  return (
    <div>
      <div className="space-y-3">
        {config.pairs.map((pair, leftIdx) => {
          const selectedRight = matches[leftIdx];
          const isCorrect = submitted && selectedRight === leftIdx;
          const isWrong = submitted && selectedRight !== undefined && selectedRight !== null && selectedRight !== leftIdx;

          return (
            <div key={leftIdx} className="flex items-center gap-3">
              {/* Left item */}
              <div className={`flex-1 p-4 rounded-xl border-2 font-medium text-slate-700 ${
                isCorrect ? 'bg-emerald-50 border-emerald-300' : isWrong ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200'
              }`}>
                {pair.left}
              </div>

              <ArrowRight size={20} className="text-slate-400 flex-shrink-0" />

              {/* Right dropdown */}
              <div className="flex-1">
                <select
                  value={selectedRight ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : parseInt(e.target.value);
                    setMatches(prev => ({ ...prev, [leftIdx]: val }));
                  }}
                  disabled={submitted}
                  className={`w-full p-4 rounded-xl border-2 font-medium transition-colors ${
                    isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : isWrong ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                  }`}
                >
                  <option value="">{t.select}</option>
                  {shuffledRight.map((rightIdx) => (
                    <option
                      key={rightIdx}
                      value={rightIdx}
                      disabled={usedRight.has(rightIdx) && matches[leftIdx] !== rightIdx}
                    >
                      {config.pairs[rightIdx].right}
                    </option>
                  ))}
                </select>
              </div>

              {/* Feedback icon */}
              {submitted && (
                <div className="flex-shrink-0">
                  {isCorrect ? (
                    <Check size={24} className="text-emerald-500" />
                  ) : (
                    <X size={24} className="text-red-500" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit / Results */}
      <div className="mt-6 flex items-center justify-between">
        {submitted ? (
          <>
            <span className={`text-lg font-semibold ${allCorrect ? 'text-emerald-600' : 'text-slate-700'}`}>
              {allCorrect ? t.perfect : t.score(correctCount, config.pairs.length)}
            </span>
            {!allCorrect && (
              <button onClick={handleRetry} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                <RefreshCw size={16} /> {t.retry}
              </button>
            )}
          </>
        ) : (
          <button
            onClick={handleCheck}
            disabled={Object.keys(matches).length < config.pairs.length}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium ml-auto"
          >
            {t.check}
          </button>
        )}
      </div>
    </div>
  );
}

// --- MCQ Card Block ---

function MCQCardBlock({ config, lang }: { config: MCQCardConfig; lang: Language }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const t = {
    clickToSelect: lang === 'fr' ? 'Sélectionnez une réponse' : 'Select an answer',
    correct: lang === 'fr' ? 'Bonne réponse !' : 'Correct answer!',
    incorrect: lang === 'fr' ? 'Mauvaise réponse' : 'Incorrect',
    explanation: lang === 'fr' ? 'Explication' : 'Explanation',
    retry: lang === 'fr' ? 'Réessayer' : 'Try again',
  };

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
  };

  const handleRetry = () => {
    setSelected(null);
    setRevealed(false);
  };

  const selectedOption = selected !== null ? config.options[selected] : null;
  const isCorrect = selectedOption?.is_correct ?? false;

  return (
    <div>
      {/* Question */}
      <p className="text-lg font-semibold text-slate-800 mb-6">{config.question}</p>

      {/* Options */}
      <div className="grid gap-3 sm:grid-cols-2">
        {config.options.map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          let cardStyle = 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer';

          if (revealed) {
            if (opt.is_correct) {
              cardStyle = 'bg-emerald-50 border-emerald-400 shadow-emerald-100';
            } else if (idx === selected) {
              cardStyle = 'bg-red-50 border-red-400';
            } else {
              cardStyle = 'bg-slate-50 border-slate-200 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={revealed}
              className={`text-left p-5 rounded-xl border-2 transition-all ${cardStyle}`}
            >
              <div className="flex items-start gap-3">
                <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 ${
                  revealed && opt.is_correct ? 'bg-emerald-500 text-white'
                  : revealed && idx === selected ? 'bg-red-500 text-white'
                  : 'bg-slate-100 text-slate-600'
                }`}>
                  {revealed ? (opt.is_correct ? <Check size={16} /> : idx === selected ? <X size={16} /> : letter) : letter}
                </span>
                <span className="text-slate-700 font-medium">{opt.text}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {revealed && (
        <div className={`mt-6 p-4 rounded-xl ${isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? <Check size={20} className="text-emerald-600" /> : <X size={20} className="text-red-600" />}
            <span className={`font-semibold ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
              {isCorrect ? t.correct : t.incorrect}
            </span>
          </div>
          {selectedOption?.explanation && (
            <div className="flex items-start gap-2 mt-2">
              <Lightbulb size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-600">{selectedOption.explanation}</p>
            </div>
          )}
          {!isCorrect && (
            <button onClick={handleRetry} className="mt-3 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm flex items-center gap-2">
              <RefreshCw size={14} /> {t.retry}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// --- Ordering Block ---

function OrderingBlock({ config, lang }: { config: OrderingConfig; lang: Language }) {
  const [order, setOrder] = useState<number[]>(() => {
    // Shuffle initial order
    const indices = config.items.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  });
  const [submitted, setSubmitted] = useState(false);

  const t = {
    instruction: lang === 'fr' ? 'Remettez les éléments dans le bon ordre' : 'Put the items in the correct order',
    check: lang === 'fr' ? 'Vérifier' : 'Check',
    correct: lang === 'fr' ? 'Parfait ! L\'ordre est correct.' : 'Perfect! The order is correct.',
    incorrect: lang === 'fr' ? 'L\'ordre n\'est pas correct. Réessayez.' : 'The order is not correct. Try again.',
    retry: lang === 'fr' ? 'Réessayer' : 'Try again',
  };

  const moveItem = (fromIdx: number, toIdx: number) => {
    if (submitted || toIdx < 0 || toIdx >= order.length) return;
    const newOrder = [...order];
    const [moved] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, moved);
    setOrder(newOrder);
  };

  const isCorrect = submitted && JSON.stringify(order) === JSON.stringify(config.correct_order);

  const handleRetry = () => {
    setSubmitted(false);
    const indices = config.items.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setOrder(indices);
  };

  return (
    <div>
      <p className="text-sm text-slate-500 mb-4">{t.instruction}</p>

      <div className="space-y-2">
        {order.map((itemIdx, pos) => {
          const item = config.items[itemIdx];
          const correctPos = submitted ? config.correct_order.indexOf(itemIdx) : -1;
          const isItemCorrect = submitted && correctPos === pos;

          return (
            <div
              key={itemIdx}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                submitted
                  ? isItemCorrect
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-red-50 border-red-300'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 ${
                submitted
                  ? isItemCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {pos + 1}
              </span>
              <span className="flex-1 font-medium text-slate-700">{item.text}</span>
              {!submitted && (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveItem(pos, pos - 1)}
                    disabled={pos === 0}
                    className={`p-1 rounded transition-colors ${pos === 0 ? 'text-slate-300' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    onClick={() => moveItem(pos, pos + 1)}
                    disabled={pos === order.length - 1}
                    className={`p-1 rounded transition-colors ${pos === order.length - 1 ? 'text-slate-300' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
              )}
              {submitted && (
                isItemCorrect
                  ? <Check size={20} className="text-emerald-500 flex-shrink-0" />
                  : <X size={20} className="text-red-500 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        {submitted ? (
          <div className={`p-4 rounded-xl ${isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
            <p className={`font-semibold ${isCorrect ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isCorrect ? t.correct : t.incorrect}
            </p>
            {!isCorrect && (
              <button onClick={handleRetry} className="mt-3 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm flex items-center gap-2">
                <RefreshCw size={14} /> {t.retry}
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setSubmitted(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            {t.check}
          </button>
        )}
      </div>
    </div>
  );
}

// --- Fill Gaps Block ---

function FillGapsBlock({ config, lang }: { config: FillGapsConfig; lang: Language }) {
  const [answers, setAnswers] = useState<string[]>(config.blanks.map(() => ''));
  const [submitted, setSubmitted] = useState(false);

  const t = {
    check: lang === 'fr' ? 'Vérifier' : 'Check',
    retry: lang === 'fr' ? 'Réessayer' : 'Try again',
    hint: lang === 'fr' ? 'Indice' : 'Hint',
    correct: lang === 'fr' ? 'Toutes les réponses sont correctes !' : 'All answers are correct!',
    score: (c: number, total: number) => lang === 'fr' ? `${c}/${total} correct${c > 1 ? 's' : ''}` : `${c}/${total} correct`,
  };

  // Split text by {blank} markers
  const parts = config.text.split(/\{blank\}/gi);
  const results = submitted
    ? config.blanks.map((blank, i) =>
        (answers[i] || '').toLowerCase().trim() === blank.answer.toLowerCase().trim()
      )
    : [];
  const correctCount = results.filter(Boolean).length;
  const allCorrect = correctCount === config.blanks.length;

  return (
    <div>
      {/* Text with blanks */}
      <div className="text-lg leading-relaxed text-slate-700 mb-6">
        {parts.map((part, i) => (
          <span key={i}>
            <span>{part}</span>
            {i < config.blanks.length && (
              <span className="inline-block mx-1 align-baseline">
                <input
                  type="text"
                  value={answers[i]}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[i] = e.target.value;
                    setAnswers(newAnswers);
                  }}
                  disabled={submitted}
                  placeholder={config.blanks[i].hint || '...'}
                  className={`inline-block w-32 px-3 py-1 border-b-2 text-center font-medium transition-colors outline-none ${
                    submitted
                      ? results[i]
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-blue-400 bg-blue-50 text-slate-800 focus:border-blue-600'
                  }`}
                />
                {submitted && !results[i] && (
                  <span className="text-xs text-emerald-600 ml-1">({config.blanks[i].answer})</span>
                )}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Submit / Results */}
      <div className="mt-4">
        {submitted ? (
          <div className={`p-4 rounded-xl ${allCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
            <p className={`font-semibold ${allCorrect ? 'text-emerald-700' : 'text-amber-700'}`}>
              {allCorrect ? t.correct : t.score(correctCount, config.blanks.length)}
            </p>
            {!allCorrect && (
              <button
                onClick={() => { setSubmitted(false); setAnswers(config.blanks.map(() => '')); }}
                className="mt-3 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm flex items-center gap-2"
              >
                <RefreshCw size={14} /> {t.retry}
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setSubmitted(true)}
            disabled={answers.some(a => !a.trim())}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {t.check}
          </button>
        )}
      </div>
    </div>
  );
}
