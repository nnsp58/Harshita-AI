export function renderMessageText(text) {
  if (!text) return null;
  const cleanedText = text.replace(/^\[[^\]]*रूटिंग[^\]]*\]\s*/, '');
  const parts = cleanedText.split(/(\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
  return (
    <p className="break-words whitespace-pre-wrap">
      {parts.map((part, i) => {
        const match = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
        if (match) {
          return <a key={i} href={match[2]} className="text-amber-400 hover:text-amber-300 underline font-semibold">{match[1]}</a>;
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}
