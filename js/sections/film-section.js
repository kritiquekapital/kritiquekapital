const HAIRPIN_BASE = "https://pub-4df4e35c254c4f02b20a98409b10c2df.r2.dev/film/hairpin";
const THREE_NATIONS_BASE = "https://pub-4df4e35c254c4f02b20a98409b10c2df.r2.dev/film/three-nations";
const UKRAINE_BASE = "https://pub-4df4e35c254c4f02b20a98409b10c2df.r2.dev/film/ukraine";

export const filmSection = {
  title: "film",
  kicker: "cinema, scene analysis, sound, motion, and visual argument",
  modules: [
    {
      type: "film-collection-browser",
      title: "bodies of work",
      description:
        "Switch between film projects, scene studies, and national cinema work instead of stacking everything into one endless page.",
      collections: [
        {
          id: "hairpin-circus",
          label: "hairpin circus",
          eyebrow: "featured film study",
          title: "Hairpin Circus (ヘアピン・サーカス)",
          dek:
            "Speed isn’t freedom–glare, velocity, and machine pressure say more than exposition ever could.",
          layout: [
            ["poster-study", "stills"]
          ],
          modules: [
            {
              id: "poster-study",
              type: "poster-study",
              title: "ヘアピン・サーカス",
              kicker: "poster study",
              slides: [
                {
                  src: `${HAIRPIN_BASE}/posters/hairpin-poster-1.jpg`,
                  alt: "Hairpin Circus poster one",
                  pieceTitle: "projection through speed",
                  background:
                    "Hairpin Circus sits at the intersection of youth drift, machine fixation, and postwar restlessness, where driving stops reading as pastime and starts reading as compulsion. The film treats speed less as escape than as a way characters press against guilt, desire, and the limits of control.",
                  thesis:
                    "The first poster is the clearest statement of the film’s logic: face, roadway, machine, and distance collapse into the same image. The car is no longer just an object inside the frame–it becomes the surface onto which feeling, memory, and pressure are projected.",
                  facts: [
                    { label: "country", value: "Japan" },
                    { label: "studio", value: "Toho Co., Ltd." },
                    { label: "year", value: "1972" },
                    { label: "format", value: "theatrical poster" }
                  ]
                },
                {
                  src: `${HAIRPIN_BASE}/posters/hairpin-poster-2.jpg`,
                  alt: "Hairpin Circus poster two",
                  pieceTitle: "tunnel enclosure",
                  background:
                    "Again and again, the film turns the road into a corridor rather than an opening. Lanes, tunnel walls, headlights, and barriers compress motion into something directed and claustrophobic, making speed feel less like liberation than like confinement under force.",
                  thesis:
                    "This poster foregrounds that enclosure. Its tunnel glare and compressed roadway reduce romance and danger to the same visual channel, making forward motion feel controlled, luminous, and trapped all at once. The thrill is real, but freedom never is.",
                  facts: [
                    { label: "country", value: "Japan" },
                    { label: "studio", value: "Toho Co., Ltd." },
                    { label: "year", value: "1972" },
                    { label: "format", value: "theatrical poster" }
                  ]
                },
                {
                  src: `${HAIRPIN_BASE}/posters/hairpin-poster-3.jpg`,
                  alt: "Hairpin Circus poster three",
                  pieceTitle: "collision logic",
                  background:
                    "At its strongest, Hairpin Circus is not just about racing but about unstable desire pushed through machinery. Its cars carry attraction, rivalry, guilt, and fatal drift, so that movement itself begins to look like a form of damage already in progress.",
                  thesis:
                    "The third poster is the harshest of the set because it abandons atmosphere for rupture. Blown contrast, impact energy, and near-crash force turn the automobile from seductive icon into unstable body–something already tipping from velocity into failure.",
                  facts: [
                    { label: "country", value: "Japan" },
                    { label: "studio", value: "Toho Co., Ltd." },
                    { label: "year", value: "1972" },
                    { label: "format", value: "theatrical poster" }
                  ]
                }
              ]
            },
            {
              id: "stills",
              type: "slideshow",
              title: "image groups",
              description: "",
              series: [
                {
                  id: "flash",
                  label: "flash",
                  cover: `${HAIRPIN_BASE}/stills/flash-01.jpg`,
                  slides: [
                    {
                      src: `${HAIRPIN_BASE}/stills/flash-01.jpg`,
                      alt: "Hairpin Circus flash still 01",
                      pieceTitle: "glare threshold",
                      fullDescription:
                        "Placeholder description for this frame. This note can later be replaced with a more specific reading of glare, motion, and visual pressure in the shot."
                    },
                    {
                      src: `${HAIRPIN_BASE}/stills/flash-02.jpg`,
                      alt: "Hairpin Circus flash still 02",
                      pieceTitle: "visibility as pressure",
                      fullDescription:
                        "Placeholder description for this frame. This note can later be replaced with a closer explanation of reflections, distortion, and roadway intensity."
                    },
                    {
                      src: `${HAIRPIN_BASE}/stills/flash-03.jpg`,
                      alt: "Hairpin Circus flash still 03",
                      pieceTitle: "corridor of glare",
                      fullDescription:
                        "Placeholder description for this frame. This note can later be replaced with a reading of compressed space and the tunnel-like logic of speed."
                    },
                    {
                      src: `${HAIRPIN_BASE}/stills/flash-04.jpg`,
                      alt: "Hairpin Circus flash still 04",
                      pieceTitle: "machine body",
                      fullDescription:
                        "Placeholder description for this frame. This note can later be replaced with a reading of the car as the film’s expressive body."
                    },
                    {
                      src: `${HAIRPIN_BASE}/stills/flash-05.jpg`,
                      alt: "Hairpin Circus flash still 05",
                      pieceTitle: "light bleed",
                      fullDescription:
                        "Placeholder description for this frame. This note can later be replaced with a reading of smeared light and unstable navigation."
                    }
                  ]
                },
                {
                  id: "tide",
                  label: "tide",
                  cover: `${HAIRPIN_BASE}/stills/tide-01.jpg`,
                  slides: [
                    {
                      src: `${HAIRPIN_BASE}/stills/tide-01.jpg`,
                      alt: "Hairpin Circus tide still 01",
                      pieceTitle: "composure inside speed",
                      fullDescription:
                        "Placeholder description for this frame. This note can later be replaced with a reading of face, control, and interior tension."
                    },
                    {
                      src: `${HAIRPIN_BASE}/stills/tide-02.jpg`,
                      alt: "Hairpin Circus tide still 02",
                      pieceTitle: "attention held in profile",
                      fullDescription:
                        "Placeholder description for this frame. This note can later be replaced with a reading of profile framing and withheld intimacy."
                    },
                    {
                      src: `${HAIRPIN_BASE}/stills/tide-03.jpg`,
                      alt: "Hairpin Circus tide still 03",
                      pieceTitle: "interiority through glass",
                      fullDescription:
                        "Placeholder description for this frame. This note can later be replaced with a reading of reflection, enclosure, and filtered emotion."
                    },
                    {
                      src: `${HAIRPIN_BASE}/stills/tide-04.jpg`,
                      alt: "Hairpin Circus tide still 04",
                      pieceTitle: "drift toward impact",
                      fullDescription:
                        "Placeholder description for this frame. This note can later be replaced with a reading of diagonal movement and unresolved danger."
                    },
                    {
                      src: `${HAIRPIN_BASE}/stills/tide-05.jpg`,
                      alt: "Hairpin Circus tide still 05",
                      pieceTitle: "shared acceleration",
                      fullDescription:
                        "Placeholder description for this frame. This note can later be replaced with a reading of speed as proximity and emotional exchange."
                    }
                  ]
                },
                {
                  id: "snow",
                  label: "snow",
                  cover: `${HAIRPIN_BASE}/stills/snow-01.jpg`,
                  slides: [
                    {
                      src: `${HAIRPIN_BASE}/stills/snow-01.jpg`,
                      alt: "Hairpin Circus snow still 01",
                      pieceTitle: "engineering in climate",
                      fullDescription:
                        "Placeholder description for this frame. This note can later be replaced with a reading of traction, terrain, and machine control."
                    },
                    {
                      src: `${HAIRPIN_BASE}/stills/snow-02.jpg`,
                      alt: "Hairpin Circus snow still 02",
                      pieceTitle: "motion against blankness",
                      fullDescription:
                        "Placeholder description for this frame. This note can later be replaced with a reading of motion set against open, stripped-down land."
                    }
                  ]
                },
                {
                  id: "crash",
                  label: "crash",
                  cover: `${HAIRPIN_BASE}/stills/crash-01.jpg`,
                  slides: [
                    {
                      src: `${HAIRPIN_BASE}/stills/crash-01.jpg`,
                      alt: "Hairpin Circus crash still 01",
                      pieceTitle: "threshold of rupture",
                      fullDescription:
                        "Placeholder description for this frame. This note can later be replaced with a reading of collision pressure, glare, and the edge of failure."
                    },
                    {
                      src: `${HAIRPIN_BASE}/posters/hairpin-poster-1.jpg`,
                      alt: "Hairpin Circus racing clip poster frame",
                      pieceTitle: "anchor fragment",
                      mediaType: "video",
                      videoSrc: `${HAIRPIN_BASE}/clips/hairpin-prix.mp4`,
                      poster: `${HAIRPIN_BASE}/posters/hairpin-poster-1.jpg`,
                      fullDescription:
                        "Placeholder description for this video frame. This slot can later describe how the moving sequence confirms the film’s rhythm, sound, and roadway pressure."
                    }
                  ]
                },
                {
                  id: "ready",
                  label: "ready",
                  cover: `${HAIRPIN_BASE}/stills/ready-01.jpg`,
                  slides: [
                    {
                      src: `${HAIRPIN_BASE}/stills/ready-01.jpg`,
                      alt: "Hairpin Circus ready still 01",
                      pieceTitle: "aftermath enters the room",
                      fullDescription:
                        "Placeholder description for this frame. This note can later be replaced with a reading of restraint, aftermath, and consequence."
                    },
                    {
                      src: `${HAIRPIN_BASE}/stills/ready-02.jpg`,
                      alt: "Hairpin Circus ready still 02",
                      pieceTitle: "shock held inward",
                      fullDescription:
                        "Placeholder description for this frame. This note can later be replaced with a reading of inward reaction and emotional containment."
                    },
                    {
                      src: `${HAIRPIN_BASE}/stills/ready-03.jpg`,
                      alt: "Hairpin Circus ready still 03",
                      pieceTitle: "calm delivery, violent content",
                      fullDescription:
                        "Placeholder description for this frame. This note can later be replaced with a reading of composure colliding with catastrophe."
                    }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: "world-cinema",
          label: "3 Nations",
          eyebrow: "comparative work",
          title: "three nations. three stills. three cinemas.",
          dek:
            "A comparative framing exercise that uses three curated grabs to show how different national cinemas project different pressures, values, and historical tendencies.",
          layout: [
            ["triptych", "triptych"]
          ],
          modules: [
            {
              id: "triptych",
              type: "film-triptych",
              title: "National identity through film",
              description: "",
              items: [
                {
                  src: `${THREE_NATIONS_BASE}/seven-samurai.png`,
                  alt: "Seven Samurai still by Akira Kurosawa",
                  title: "Seven Samurai",
                  meta: "Akira Kurosawa · Japan · 1954",
                  thesis:
                    "A cinema shaped by duty, loss, and the strain between purpose and historical obsolescence.",
                  copy:
                    "Taken from the closing moments of Kurosawa’s masterpiece, this rising shot settles on the graves of the fallen samurai, their swords serving as markers and their ribbons as flags. As the peasants return to the land, the surviving warriors remain fixed before the remnants of their dead. The image crystallizes the cost of duty, the clash between old codes and changing realities, and the problem of purpose once a historical role has already passed."
                },
                {
                  src: `${THREE_NATIONS_BASE}/city-of-god.png`,
                  alt: "City of God still by Fernando Meirelles and Kátia Lund",
                  title: "City of God",
                  meta: "Fernando Meirelles & Kátia Lund · Brazil · 2002",
                  thesis:
                    "A cinema of social violence, survival, and the repeated abandonment of youth.",
                  copy:
                    "Golden light, vivid color, and the restless energy of the favela collide here with one of the film’s most brutal situations. Li’l Zé places a gun in a child’s hand and forces an impossible choice, turning innocence, coercion, spectacle, and death into the same frame. The image is beautiful and horrifying at once. That contradiction is exactly the point: the still condenses socio-economic struggle, political neglect, and the way a nation repeatedly fails its youth."
                },
                {
                  src: `${THREE_NATIONS_BASE}/shadows-of-forgotten-ancestors.png`,
                  alt: "Shadows of Forgotten Ancestors still by Sergei Parajanov",
                  title: "Shadows of Forgotten Ancestors",
                  meta: "Sergei Parajanov · Ukraine (Soviet era) · 1965",
                  thesis:
                    "A cinema of identity, land, ritual, and cultural persistence under historical pressure.",
                  copy:
                    "This still binds folk tradition, grief, and landscape into one image. Ivan moves through a scorched field, suspended between personal loss and a much older cycle of blood, memory, and rebirth. The land is not just setting here but inheritance, and the frame turns agrarian life, spiritual attachment, and historical rupture into one visual field. It speaks to Ukrainian cultural depth while also carrying the pressure of its Soviet entanglement."
                }
              ]
            }
          ]
        },

        {
          id: "ukraine-national-cinema",
          label: "ukrainian cinema",
          eyebrow: "national cinema project",
          title: "Ukraine. A National Cinema Project.",
          dek:
            "A deeper project body tracing Ukrainian cinema through early image-worlds, Soviet entanglement, folklore, rupture, and reassertion.",
          layout: [
            ["overview", "deck"],
            ["historical-line", "historical-line"],
            ["clip-foundations", "clip-entanglement"],
            ["ending-clip", "ending-clip"]
          ],
          modules: [
            {
              id: "overview",
              type: "film-analysis",
              title: "project frame",
              subtitle: "history, pressure, and reassertion",
              media: {
                type: "image",
                src: `${UKRAINE_BASE}/man-w-a-cam.jpg`,
                ariaLabel: "Camera and figure image for the Ukrainian cinema project"
              },
              claim:
                "This project follows Ukrainian cinema as a layered national formation rather than a thin resistance summary. It moves from Dovzhenko’s early image-world through Soviet structures of production and pressure, into folklore, overlapping identities, rupture, satire, memory, and later forms of reassertion.",
              bullets: [
                "Soviet connection is treated as both condition and constraint -- a shared cinema space structured by uneven power, not a neutral inheritance.",
                "The project refuses to collapse Ukrainian cinema into Russian cinema or a generic Soviet category even when institutions, circulation, and visual languages overlap.",
                "Land, ritual, memory, and collective image-life persist across domination and historical upheaval, giving the cinema a continuity deeper than any one period label.",
                "Later work is approached as recovery and reassertion -- not as a cinema appearing from nowhere after collapse, but as one reworking what endured beneath pressure."
              ],
              footer:
                "The deck’s own movement -- The Ukraine Trilogy, the Soviet era and collective identity, and folklore and national identity -- supplies the spine for the whole section."
            },
            {
              id: "deck",
              type: "slideshow",
              title: "project line",
              description: "A deck-like image line built from the project material itself rather than an embedded slideshow.",
              series: [
                {
                  id: "foundations",
                  label: "foundations",
                  slides: [
                    {
                      src: `${UKRAINE_BASE}/stills/zvenygora-01.jpg`,
                      alt: "Still from Zvenygora",
                      pieceTitle: "myth, land, and origin",
                      fullDescription:
                        "The project opens with early Ukrainian cinema as an image-world of land, labor, myth, and collective life. Dovzhenko matters here not just as a canonical director, but as a way of seeing: the earth carries memory, bodies move within seasonal rhythm, and national cinema begins as visual relation before it becomes program or slogan."
                    },
                    {
                      src: `${UKRAINE_BASE}/stills/arsenal-01.jpg`,
                      alt: "Still from Arsenal",
                      pieceTitle: "collective life under historical force",
                      fullDescription:
                        "Even at the level of the early frame, private feeling and public crisis are fused. The image does not isolate national identity from upheaval; it shows identity being formed inside conflict, labor, and the pressure of modern history."
                    },
                    {
                      src: `${UKRAINE_BASE}/stills/earth-01.jpg`,
                      alt: "Still from Earth",
                      pieceTitle: "agrarian poetics",
                      fullDescription:
                        "Land is not backdrop here. It is inheritance, cosmology, and social ground. This is one of the key reasons the project keeps returning to Dovzhenko: later Ukrainian cinema repeatedly reactivates this bond between image, earth, collective life, and loss."
                    },
                    {
                      src: `${UKRAINE_BASE}/stills/blue-earth-01.jpg`,
                      alt: "Blue-toned Earth still",
                      pieceTitle: "the image after memory",
                      fullDescription:
                        "Even when recolored, reframed, or encountered later, the early image keeps functioning as a source. The point is not purity of origin but durability -- the survival of a visual grammar that later periods inherit under very different political names."
                    }
                  ]
                },
                {
                  id: "entanglement",
                  label: "soviet entanglement",
                  slides: [
                    {
                      src: `${UKRAINE_BASE}/stills/state-funeral-01.jpg`,
                      alt: "State Funeral still",
                      pieceTitle: "spectacle and collective identity",
                      fullDescription:
                        "The Soviet era expands scale, circulation, and institutional force while tightening ideological legibility. Collective identity becomes something staged as mass image, and cinema is pulled toward spectacle, pedagogy, and the managed visibility of belonging."
                    },
                    {
                      src: `${UKRAINE_BASE}/stills/well-just-you-wait.jpg`,
                      alt: "Well, Just You Wait still",
                      pieceTitle: "shared space, uneven control",
                      fullDescription:
                        "Shared animation and popular culture matter here because they complicate the map. Ukrainian cinema is not sealed off from Soviet forms; it is entangled with them. But entanglement is not equality. The cultural field is shared while authority over naming, prestige, and historical centrality remains uneven."
                    },
                    {
                      src: `${UKRAINE_BASE}/stills/neznayka-01.jpg`,
                      alt: "Neznayka still",
                      pieceTitle: "side stories and overlapping identities",
                      fullDescription:
                        "This is where the project widens beyond a single heroic line. Side stories, animation, and cross-regional production histories show how identity survives in lateral forms as well -- not only in major auteur work, but in the strange, popular, and half-overlooked edges of the archive."
                    },
                    {
                      src: `${UKRAINE_BASE}/stills/poma-01.jpg`,
                      alt: "Still associated with Sergei Parajanov's visual field",
                      pieceTitle: "ritual excess against flattening",
                      fullDescription:
                        "Figures like Parajanov belong at the hinge of this section because they reveal the instability of Soviet classification itself. Folklore, costume, ornament, and ritual image-life push against ideological simplification while still moving through the institutions of the period."
                    }
                  ]
                },
                {
                  id: "reassertion",
                  label: "reassertion / rupture",
                  slides: [
                    {
                      src: `${UKRAINE_BASE}/stills/ukrainian-costume.jpg`,
                      alt: "Ukrainian costume still",
                      pieceTitle: "folklore as persistence",
                      fullDescription:
                        "Folklore is not decorative in this project. It is one of the ways national cinema remembers itself across rupture -- through costume, ritual pattern, oral inheritance, and symbolic excess that keeps reappearing when official narratives shift."
                    },
                    {
                      src: `${UKRAINE_BASE}/stills/ukrainian-wedding.jpg`,
                      alt: "Ukrainian wedding still",
                      pieceTitle: "ritual, continuity, survival",
                      fullDescription:
                        "Wedding imagery matters because it binds private ceremony to collective continuity. The frame becomes a site where culture is performed, remembered, and handed forward -- not outside history, but stubbornly within it."
                    },
                    {
                      src: `${UKRAINE_BASE}/stills/mavka-01.jpg`,
                      alt: "Mavka still",
                      pieceTitle: "myth returns in new form",
                      fullDescription:
                        "Later Ukrainian cinema and animation do not simply abandon the old symbolic archive. They repurpose it. Myth, folklore, and land return under altered conditions, showing reassertion as development rather than nostalgic retreat."
                    },
                    {
                      src: `${UKRAINE_BASE}/stills/donbass-sausage-06.jpg`,
                      alt: "Donbass still",
                      pieceTitle: "satire after inheritance",
                      fullDescription:
                        "By the time the project reaches contemporary work, the tone can turn satirical, fractured, and brutal without severing itself from the earlier line. The cinema remembers what came before even while exposing the absurdity, violence, and residue of the present."
                    }
                  ]
                }
              ]
            },
            {
              id: "historical-line",
              type: "film-analysis-grid",
              title: "historical line",
              items: [
                {
                  heading: "foundations",
                  copy:
                    "Dovzhenko anchors the earliest layer: agrarian space, collective life, and land as more than backdrop. Ukrainian cinema begins here as a poetic image-world in which earth, labor, myth, and social being are already fused."
                },
                {
                  heading: "soviet entanglement",
                  copy:
                    "The Soviet period expands resources and circulation while tightening ideological control. Cinema becomes a shared institutional field, but never an evenly governed one. Collective identity, censorship, and political pressure shape what can be seen, who can define it, and how it is remembered."
                },
                {
                  heading: "reassertion / rupture",
                  copy:
                    "Later Ukrainian cinema returns with fracture, memory, folklore, satire, and refusal. National cinema here is not simple aftermath. It is reassertion: a recovery of image, language, ritual, and historical continuity against erasure and flattening."
                }
              ]
            },
            {
              id: "clip-foundations",
              type: "film-analysis",
              title: "clip study I",
              subtitle: "ritual continuity",
              media: {
                type: "video",
                src: `${UKRAINE_BASE}/clips/ukranian-wedding.mp4`,
                poster: `${UKRAINE_BASE}/stills/ukrainian-wedding.jpg`,
                ariaLabel: "Ukrainian wedding clip study"
              },
              claim:
                "This supporting clip keeps the project close to ritual, land, and inherited symbolic life. Instead of treating culture as background, the sequence shows ceremony as a way cinema stores continuity -- bodily, visually, and collectively.",
              bullets: [
                "The force of the clip is in repetition, costume, and gesture: culture survives by being performed, not merely referenced.",
                "It helps tie folklore to national identity without turning either into museum material or empty authenticity.",
                "Placed after the historical line, it lets the earlier foundational grammar return as living practice rather than distant origin."
              ],
              footer:
                "This card should read as support, not climax -- a reminder that continuity often survives through ritual form."
            },
            {
              id: "clip-entanglement",
              type: "film-analysis",
              title: "clip study II",
              subtitle: "rupture, street energy, and reassertion",
              media: {
                type: "video",
                src: `${UKRAINE_BASE}/clips/ukraines-revolution.mp4`,
                poster: `${UKRAINE_BASE}/stills/winter-fire-01.jpg`,
                ariaLabel: "Ukraine's revolution clip study"
              },
              claim:
                "This second support clip shifts the project into rupture. The frame becomes crowded with movement, collective force, and historical urgency, showing national cinema not as stable essence but as something reasserted in the midst of conflict.",
              bullets: [
                "It connects earlier collective image-life to a later, more exposed political moment without pretending the terms are identical.",
                "The value of the clip is in pressure: bodies, public space, and national visibility all become unstable at once.",
                "Seen beside the ritual card, it makes clear that continuity and rupture are not opposites here -- they are part of the same historical cinema line."
              ],
              footer:
                "This is the sharper support card, where inherited identity has to pass through modern crisis and public confrontation."
            },
            {
              id: "ending-clip",
              type: "film-analysis",
              title: "featured ending clip",
              subtitle: "closing argument",
              media: {
                type: "image",
                src: `${UKRAINE_BASE}/stills/donbass-sausage-03.jpg`,
                ariaLabel: "Placeholder still for featured ending clip"
              },
              claim:
                "The ending clip is where the whole project folds back through itself. What began with land, collective life, and visual inheritance returns under pressure as satire, memory, spectacle, and survival. Earlier histories are not left behind; they are repurposed inside a harsher present.",
              bullets: [
                "This final sequence should land as culmination, not example -- the project’s entire argument compressed into one late image-event.",
                "Memory matters here because the frame carries earlier Soviet and Ukrainian image logics at once, then bends them into critique rather than obedience.",
                "Satire and inheritance should coexist in the ending: the image can mock, wound, remember, and refuse without resolving into purity.",
                "What survives at the close is not innocence, but persistence -- a national cinema still bearing historical weight while refusing disappearance."
              ],
              footer:
                "Swap the final clip URL here when ready. For now, the card is built to hold the project’s strongest script and function as the closing thesis in motion."
            }
          ]
        }
      ]
    }
  ]
};
