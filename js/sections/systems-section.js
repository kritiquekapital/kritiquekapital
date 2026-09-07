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
          title: "ideo.cam Analytics SQL",
          hook: "A full SQL pipeline built from raw event exports.",
          stats: [
            { label: "visits",       value: "391 / 10 weeks" },
            { value: "1,649",        label: "kisses clicked" },
            { value: "3,929",        label: "photos clicked" },
            { value: "175",          label: "Spotify goals scored" },
            { value: "304",          label: "outbound links clicked" }
          ],
          takeaways: [
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
