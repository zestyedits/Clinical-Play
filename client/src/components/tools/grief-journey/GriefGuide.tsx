import { motion, AnimatePresence } from "framer-motion";

interface GriefGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GriefGuide({ isOpen, onClose }: GriefGuideProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.6)",
              zIndex: 50,
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: "80%",
              background: "#0d0820",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              zIndex: 51,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
              border: "1px solid rgba(196,154,108,0.12)",
              borderBottom: "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px 12px",
                borderBottom: "1px solid rgba(196,154,108,0.1)",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{"\uD83C\uDFEE"}</span>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#e8dcc8",
                    fontFamily: "'Lora', Georgia, serif",
                  }}
                >
                  About Grief Therapy
                </h3>
              </div>
              <button
                onClick={onClose}
                data-testid="button-close-grief-guide"
                style={{
                  background: "rgba(255, 255, 255, 0.07)",
                  border: "none",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  color: "#e8dcc8",
                  fontSize: 16,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {"\u00D7"}
              </button>
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: "16px 20px 28px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                <section>
                  <h4
                    style={{
                      margin: "0 0 8px",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#c49a6c",
                      fontFamily: "'Lora', Georgia, serif",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {"\uD83D\uDD6F\uFE0F"} Worden's Four Tasks of Mourning
                  </h4>
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: 12,
                      color: "rgba(232,220,200,0.6)",
                      lineHeight: 1.65,
                    }}
                  >
                    J. William Worden proposed that grief is not a passive experience of stages, but involves active tasks that the bereaved person must work through. These four tasks are not linear and can be revisited over time.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { num: "1", title: "Accept the Reality of the Loss", desc: "Coming to believe that the person is gone and will not return \u2014 both intellectually and emotionally." },
                      { num: "2", title: "Work Through the Pain of Grief", desc: "Acknowledging and processing the emotional pain, rather than avoiding or suppressing it." },
                      { num: "3", title: "Adjust to a World Without the Deceased", desc: "Adapting to external, internal, and spiritual changes brought about by the loss." },
                      { num: "4", title: "Find an Enduring Connection", desc: "Relocating the deceased in emotional life in a way that allows you to continue living, while maintaining an inner bond." },
                    ].map((task) => (
                      <div
                        key={task.num}
                        style={{
                          display: "flex",
                          gap: 10,
                          padding: "8px 10px",
                          borderRadius: 8,
                          background: "rgba(196,154,108,0.05)",
                          border: "1px solid rgba(196,154,108,0.1)",
                        }}
                      >
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: "rgba(196,154,108,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            color: "#c49a6c",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {task.num}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#e8dcc8", marginBottom: 2 }}>
                            {task.title}
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(232,220,200,0.5)", lineHeight: 1.55 }}>
                            {task.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4
                    style={{
                      margin: "0 0 8px",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#c49a6c",
                      fontFamily: "'Lora', Georgia, serif",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {"\uD83C\uDF1F"} Continuing Bonds Theory
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "rgba(232,220,200,0.6)",
                      lineHeight: 1.65,
                    }}
                  >
                    Continuing Bonds (Klass, Silverman & Nickman, 1996) challenges the historical view that grief requires "letting go." Research shows that maintaining an ongoing inner relationship with the person lost is not only normal but healthy. People carry the deceased as an inner presence, consulting their values, sensing their guidance, and keeping their memory alive through ritual and story.
                  </p>
                </section>

                <section>
                  <h4
                    style={{
                      margin: "0 0 8px",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#c49a6c",
                      fontFamily: "'Lora', Georgia, serif",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {"\uD83C\uDF0A"} Grief is Not Linear
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "rgba(232,220,200,0.6)",
                      lineHeight: 1.65,
                    }}
                  >
                    Modern grief research (Bonanno, 2009; Stroebe & Schut's Dual Process Model) confirms that grief oscillates naturally between confronting the loss and restoring daily functioning. Grief comes in waves, not stages. There is no timeline and no "right" way to grieve. Resilience in grief is far more common than prolonged complicated grief.
                  </p>
                </section>

                <section>
                  <h4
                    style={{
                      margin: "0 0 8px",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#c49a6c",
                      fontFamily: "'Lora', Georgia, serif",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {"\uD83E\uDDD2"} For Young People and Teens
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "rgba(232,220,200,0.6)",
                      lineHeight: 1.65,
                    }}
                  >
                    Children and adolescents grieve differently from adults. Young people may appear to "bounce back" quickly, then revisit grief at developmental milestones. Normalising their feelings, using creative and play-based approaches, and keeping communication open are core to supporting children through loss. Teens benefit from peer connection, autonomy, and having their grief taken seriously without being pathologised.
                  </p>
                </section>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
