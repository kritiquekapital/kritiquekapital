export const systemsSection = {
  title: "systems",
  kicker: "data, code, and tools built to understand how things work.",
  modules: [
    {
      type: "systems-project-grid",
      entries: [
        {
          id: "ideocam-pipeline",
          variant: "featured",
          eyebrow: "self-built · sql / data analytics",
          title: "ideo.cam Analytics SQL",
          image: null,
          hook: "ideo.cam is a site I designed, coded, and host myself–so when I wanted to understand how people actually interact with it, I built a SQL analytics stack too.",
            writeupLink: {
              label: "read the full technical write-up",
              href: "#"
          },
          stats: [
            { label: "visits",  value: "247 / 10 weeks" },
            { value: "439",     label: "kisses clicked" },
            { value: "292",     label: "photos clicked" },
            { value: "30",      label: "Spotify goals scored" },
            { value: "116",     label: "outbound links clicked" }
          ],
          takeaways: [
            "The Kiss Button is the most-used feature on the site: 71.7% of engaged visits clicked it.",
            "The Photo Gallery isn't far behind: 56.5% of engaged visits browsed the respective camera rolls.",
            "Mobile is the best-engaging device on the site, ahead of desktop–70.9% of mobile visits took a real action.",
            "Instagram drives over a third of total traffic (86 of 247 visits)",
            "Bot, dev testing and spam-referral traffic isn't deleted from the model; it's identified and labeled."
          ],
            download: {
            label: "download write-up (.zip)",
            href: "#"
          }
        },
        {
          id: "v1-library-pipeline",
          variant: "mini",
          eyebrow: "tool / music",
          title: "V1 Library Pipeline",
          hook: "PowerShell + Python tooling that keeps a large Serato library tagged, deduped, and reconciled — safely.",
          expandBullets: [
            "One-click Refresh + Move: rescans Serato crates, syncs colors/genres via TagLib-Sharp, moves files to match.",
            "Reconcile writes a preview file first and backs up the real master before ever touching it.",
            "Undo last move reverses everything from the last apply, no manual cleanup.",
            "Built-in duplicate finder (filename or Artist+Title) and a read-only library health check."
          ]
        }
      ]
    }
  ]
};
