import { useEffect, useMemo, useState } from 'react';
import { getAlphabet, glyphStyle } from '../data/alphabets';
import { playLetter, cheer } from '../lib/speech';
import { sfx } from '../lib/sfx';
import TopBar from './TopBar';
import Confetti from './Confetti';

const ROUNDS = 10;
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Practise letters the child has traced; fall back to the whole alphabet.
function buildRounds(alphabet, doneIds) {
  const learned = alphabet.letters.filter((l) => doneIds.includes(l.id));
  const pool = learned.length >= 4 ? learned : alphabet.letters;
  const targets = [];
  while (targets.length < ROUNDS) targets.push(...shuffle(pool));
  return targets.slice(0, ROUNDS).map((answer) => {
    const others = shuffle(alphabet.letters.filter((l) => l.id !== answer.id)).slice(0, 3);
    return { answer, options: shuffle([answer, ...others]) };
  });
}

export default function Quiz({ langId, progress, onFinish, onExit }) {
  const a = getAlphabet(langId);
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => buildRounds(a, progress[langId].done), [a, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState([]); // option ids tapped wrongly this round
  const [solved, setSolved] = useState(false);
  const [finished, setFinished] = useState(false);
  const round = rounds[i];

  useEffect(() => {
    if (finished) return;
    const t = setTimeout(() => playLetter(a, round.answer, { withWord: false }), 400);
    return () => clearTimeout(t);
  }, [a, round, finished]);

  const pick = (opt) => {
    if (solved || wrong.includes(opt.id)) return;
    if (opt.id === round.answer.id) {
      sfx.correct();
      setSolved(true);
      const firstTry = wrong.length === 0;
      const newScore = score + (firstTry ? 1 : 0);
      setScore(newScore);
      setTimeout(() => {
        if (i + 1 >= rounds.length) {
          const pct = Math.round((newScore / rounds.length) * 100);
          onFinish(langId, pct);
          setFinished(true);
          sfx.win();
          setTimeout(cheer, 400);
        } else {
          setI(i + 1);
          setWrong([]);
          setSolved(false);
        }
      }, 1000);
    } else {
      sfx.wrong();
      setWrong([...wrong, opt.id]);
    }
  };

  const restart = () => {
    setSeed((s) => s + 1);
    setI(0);
    setScore(0);
    setWrong([]);
    setSolved(false);
    setFinished(false);
  };

  const style = { '--main': a.theme.main, '--soft': a.theme.soft, '--deep': a.theme.deep, '--fs': a.displayScale, '--gy': a.glyphShift, '--stroke': a.textStroke };
  const pct = Math.round((score / rounds.length) * 100);
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;

  return (
    <div className="screen quiz" style={style}>
      <TopBar onBack={onExit} title={`${a.title} Quiz`} theme={a.theme}>
        <span className="pct-chip">⭐ {score}</span>
      </TopBar>

      <div className="bar">
        <div className="bar-fill" style={{ width: `${((i + (solved ? 1 : 0)) / rounds.length) * 100}%` }} />
      </div>

      {!finished && (
        <>
          <div className="card quiz-prompt" key={`p-${seed}-${i}`}>
            <p className="quiz-q">Which {a.unit || 'letter'} is this?</p>
            <button className="listen-btn" onClick={() => playLetter(a, round.answer, { withWord: false })}>
              🔊
            </button>
            <p className="quiz-name">{round.answer.name}</p>
            <p className="quiz-count">
              {i + 1} / {rounds.length}
            </p>
          </div>

          <div className="options" dir={a.dir}>
            {round.options.map((opt) => {
              const isWrong = wrong.includes(opt.id);
              const isRight = solved && opt.id === round.answer.id;
              return (
                <button
                  key={`${seed}-${i}-${opt.id}`}
                  className={`option ${isWrong ? 'is-wrong' : ''} ${isRight ? 'is-right' : ''}`}
                  style={glyphStyle(a, opt)}
                  onClick={() => pick(opt)}
                  disabled={isWrong}
                  aria-label={`Option ${opt.name}`}
                >
                  <span className="glyph">{opt.char}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {finished && (
        <div className="overlay">
          {stars >= 2 && <Confetti />}
          <div className="card done-card pop-in">
            <div className="done-stars">
              {'⭐'.repeat(stars)}
              <span className="dim">{'⭐'.repeat(3 - stars)}</span>
            </div>
            <h2>{stars === 3 ? 'Superstar!' : stars === 2 ? 'Great work!' : 'Good try!'}</h2>
            <p>
              You got <b>{score}</b> of {rounds.length} on the first try ({pct}%)
            </p>
            <p className="muted">Best score: {Math.max(progress[langId].quizBest, pct)}%</p>
            <div className="done-actions">
              <button className="btn btn-soft" onClick={onExit}>
                Letters
              </button>
              <button className="btn btn-main btn-big" onClick={restart}>
                ↺ Play again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
