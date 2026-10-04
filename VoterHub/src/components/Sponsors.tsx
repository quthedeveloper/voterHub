import { useState } from "react";
import { Plus } from "lucide-react";

// NOTE: replace these with VoteHub's real sponsors when they're confirmed.
const SPONSORS = [
  {
    name: "Campus Ballot Initiative",
    tier: "Gold",
    blurb:
      "Funds free VoteHub access for student unions running campus-wide elections, referendums, and representative votes.",
  },
  {
    name: "OpenVote Foundation",
    tier: "Silver",
    blurb:
      "Supports our open election tooling and helps nonprofits run transparent, auditable community votes at no cost.",
  },
  {
    name: "Civic Tech Collective",
    tier: "Silver",
    blurb:
      "A network of civic technologists backing accessible voting infrastructure for grassroots organizations.",
  },
  {
    name: "Neighborhood Voices Network",
    tier: "Community",
    blurb:
      "Helps local councils and resident associations gather opinions and make shared decisions with their communities.",
  },
];

export default function SponsorsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="vh-band vh-band-dark" id="sponsors">
      <div className="vh-inner">
        <p className="vh-eyebrow">Sponsors</p>
        <div className="vh-sponsors-head">
          <h2>
            Backed by people who
            <br />
            believe in voting.
          </h2>
          <p>
            These organizations help keep VoteHub free for the communities
            that need it most.
          </p>
        </div>

        <div className="vh-sponsors-list">
          {SPONSORS.map((s, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={s.name}
                className={`vh-sponsor${isOpen ? " is-open" : ""}`}
              >
                <button
                  type="button"
                  className="vh-sponsor-row"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="vh-sponsor-name">{s.name}</span>
                  <span className="vh-sponsor-right">
                    <span className="vh-sponsor-tier">{s.tier}</span>
                    <Plus size={20} className="vh-sponsor-icon" />
                  </span>
                </button>
                <div className="vh-sponsor-body">
                  <p>{s.blurb}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
