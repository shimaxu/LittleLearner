import { getAlphabet, glyphStyle } from '../data/alphabets';
import { percentFor } from '../lib/progress';
import TopBar from './TopBar';
import CaseSwitch from './CaseSwitch';

export default function LetterMap({ langId, progress, onBack, onLearn, onQuiz, onEnglishCase }) {
  const a = getAlphabet(langId);
  const done = new Set(progress[langId].done);
  const best = progress[langId].stars || {};
  const starTotal = a.letters.reduce((n, l) => n + (best[l.id] || 0), 0);
  const pct = percentFor(progress, a);
  const nextIndex = Math.max(0, a.letters.findIndex((l) => !done.has(l.id)));

  return (
    <div className="screen" style={{ '--main': a.theme.main, '--soft': a.theme.soft, '--deep': a.theme.deep, '--fs': a.displayScale, '--gy': a.glyphShift, '--stroke': a.textStroke }}>
      <TopBar onBack={onBack} title={a.title} theme={a.theme}>
        {(langId === 'en' || langId === 'enl') && <CaseSwitch value={langId} onChange={onEnglishCase} />}
        <span className="pct-chip">{pct}%</span>
      </TopBar>

      <div className="map-hero">
        <div className="bar" aria-label={`${pct}% complete`}>
          <div className="bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="map-sub">
          {done.size} of {a.letters.length} {a.unit || 'letter'}s traced
          {starTotal > 0 && <> · ★ {starTotal} of {a.letters.length * 3} stars</>}
          {progress[langId].quizBest > 0 && <> · Quiz best {progress[langId].quizBest}%</>}
        </p>
        <div className="map-actions">
          <button className="btn btn-main btn-big" onClick={() => onLearn(nextIndex)}>
            ✏️ {pct === 100 ? 'Practice again' : done.size ? 'Continue' : 'Start!'}
          </button>
          <button className="btn btn-soft btn-big" onClick={onQuiz}>
            🎯 Quiz
          </button>
        </div>
      </div>

      <div className="letter-grid" dir={a.dir}>
        {a.letters.map((l, i) => {
          const isDone = done.has(l.id);
          const isNext = i === nextIndex && pct < 100;
          return (
            <button
              key={l.id}
              className={`tile ${isDone ? 'is-done' : ''} ${isNext ? 'is-next' : ''}`}
              onClick={() => onLearn(i)}
              aria-label={`${l.name}${isDone ? `, completed${best[l.id] ? `, ${best[l.id]} of 3 stars` : ''}` : ''}`}
            >
              <span className="tile-char glyph" style={glyphStyle(a, l)}>
                {l.char}
              </span>
              <span className="tile-name">{l.name}</span>
              {isDone &&
                (best[l.id] ? (
                  <span className="tile-stars" aria-hidden="true">
                    {[1, 2, 3].map((n) => (
                      <span key={n} className={n <= best[l.id] ? 'on' : ''}>★</span>
                    ))}
                  </span>
                ) : (
                  <span className="tile-star">⭐</span>
                ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
