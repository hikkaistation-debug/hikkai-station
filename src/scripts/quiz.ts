// クイズのカード（QuizCard.astro）を動かす
// 選択肢を押すと、正解・不正解を表示して解説を出し、"quiz-answered" イベントを出します。
export function setupQuizCards(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('.quiz-card').forEach((card) => {
    const answer = Number(card.dataset.answer);
    const buttons = [...card.querySelectorAll<HTMLButtonElement>('.quiz-choice')];
    const box = card.querySelector<HTMLElement>('.quiz-answer')!;
    const result = card.querySelector<HTMLElement>('.quiz-answer__result')!;
    buttons.forEach((b) =>
      b.addEventListener('click', () => {
        if (card.dataset.done) return;
        card.dataset.done = '1';
        const pick = Number(b.dataset.choice);
        const ok = pick === answer;
        buttons.forEach((x, i) => {
          x.disabled = true;
          if (i === answer) x.classList.add('is-correct');
          else if (x === b) x.classList.add('is-wrong');
        });
        result.textContent = ok ? '⭕ 正解！' : '❌ ざんねん…';
        result.className = `quiz-answer__result ${ok ? 'is-correct' : 'is-wrong'}`;
        box.hidden = false;
        card.dispatchEvent(new CustomEvent('quiz-answered', { bubbles: true, detail: { id: card.dataset.quiz, ok } }));
      }),
    );
  });
}
