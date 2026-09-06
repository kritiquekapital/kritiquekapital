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
          eyebrow: "data / analytics",
          title: "ideo.cam Analytics Pipeline",
          hook: "A full SQL pipeline built from raw event exports — staging, dimensional modeling, fact tables, and a QA layer that documents its own bugs.",
          stats: [
            { label: "raw rows",     value: "23,071" },
            { label: "visits",       value: "391 / 10 weeks" },
            { label: "pipeline stages", value: "10" },
            { label: "engine",       value: "SQLite" }
          ],
          takeaways: [
            "Caught a silent bug that zeroed every feature-usage metric — a missing comma hidden inside a SQL comment.",
            "Found and fixed a missing-value mismatch that had misclassified 71% of all traffic as referral instead of Direct.",
            "Feature-based classification instead of URL-based, since the site is a single-page app.",
            "Layered architecture (staging → dimensions → facts → analysis → QA) so every bug was traceable to one file."
          ],
          download: {
            label: "download write-up (.zip)",
            href: "#" // TODO: point at actual zip asset
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
