import { useState } from "react";          
import { Plus } from "lucide-react"; 




const FAQ_ITEMS = [
  {
    q: "Is VoteHub free to use?",
    a: "Yes. Creating polls, sharing them, and collecting votes is free for individuals and small teams. Larger organizations that need advanced controls, custom branding, or audit exports can upgrade to a paid plan.",
  },
  {
    q: "How do you keep votes secure and anonymous?",
    a: "Every ballot is separated from the identity that cast it, so results can be tallied without linking a vote back to a voter. Poll creators can also require sign-in, restrict voting to one ballot per person, or limit access to a specific email domain.",
  },
  {
    q: "Do voters need to create an account?",
    a: "Not necessarily. You decide when you set up the poll. Open polls can be joined with just a link or a poll code, while restricted elections can require verified sign-in before a ballot is issued.",
  },
  {
    q: "Can I see results while the poll is still running?",
    a: "Yes. Results update in real time as votes come in, and you choose who can see them. Keep the tally private to yourself until voting closes, or show live results to everyone as they participate.",
  },
  {
    q: "What kinds of polls can I run?",
    a: "Anything from a quick one-question team decision to a multi-position campus election. VoteHub supports single choice, multiple choice, and ranked options, with scheduled open and close times.",
  },
  {
    q: "Can I export the results?",
    a: "Once a poll closes you can download the full results, including per-option totals and turnout figures, for your own records or reporting.",
  },
];

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="landing-faq" id="faq" style={{ marginTop: 80 }}>
      <div className="landing-faq-head">
        <p className="landing-eyebrow">QUESTIONS, ANSWERED</p>
        <h2 className="landing-voice-headings">Frequently Asked</h2>
        <p className="landing-faq-sub">
          Everything you need to know before running your first poll.
        </p>
      </div>

      <div className="landing-faq-list">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={item.q}
              className={`landing-faq-item${isOpen ? " is-open" : ""}`}
            >
              <button
                type="button"
                className="landing-faq-q"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span>{item.q}</span>
                <Plus className="landing-faq-icon" size={20} />
              </button>
              <div className="landing-faq-a">
                <p>{item.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


export {FaqSection};