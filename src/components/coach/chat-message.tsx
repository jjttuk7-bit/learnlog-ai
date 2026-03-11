interface Props {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: Props) {
  return (
    <div
      className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
          role === "user"
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-md"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
