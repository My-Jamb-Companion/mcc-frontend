import {AnimatePresence, Button, Icon, motion} from "@mcc/ui";

import Image from "next/image";
import {useEffect} from "react";

export default function ViewProspectiveStudent({
  onClose,
  student,
}: {
  onClose: () => void;
  student: ProspectiveStudent;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (student) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [student, onClose]);

  return (
    <AnimatePresence>
      {student ? (
        <>
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.2}}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          />

          <motion.section
            initial={{x: "100%", opacity: 0}}
            animate={{x: 0, opacity: 1}}
            exit={{x: "100%", opacity: 0}}
            transition={{type: "tween", duration: 0.3}}
            className="fixed top-0 right-0 z-50 h-screen w-full max-w-150 bg-white p-6 shadow-2xl overflow-y-auto"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-muted/20">
                <div className="flex items-center gap-3">
                  <Button
                    variant={"ghost"}
                    leftIcon={<Icon icon="mdi-light:share" />}
                  >
                    Share
                  </Button>
                  <Button
                    variant={"ghost"}
                    leftIcon={<Icon icon="mdi-light:share" />}
                  >
                    Export
                  </Button>
                </div>

                <Button
                  onClick={onClose}
                  variant={"ghost"}
                  size={"fit"}
                  className="rounded-full py-1 px-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  aria-label="Close panel"
                >
                  ✕
                </Button>
              </div>

              <div className="flex flex-col relative">
                <Image
                  src="/assets/images/ProfileBg.png"
                  alt="profileBg"
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover rounded-lg"
                  priority
                />

                <div className="absolute left-1/2 top-[50%] z-10 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative size-33 overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                    <img
                      src={student.avatar}
                      alt="profile"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>

                {/* GLASS CARD */}
                <div className="absolute bottom-2 left-1/2 z-20 w-[96%] -translate-x-1/2 rounded-xl border border-white/20 bg-black/30 p-6 backdrop-blur-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="font-medium text-white text-xl">
                        {student.name}
                      </h1>
                      <h1 className="flex items-center gap-1 text-gray-400 text-xs">
                        <div className="h-1.5 w-1.5  bg-green-500 rounded-full" />
                        <span>Active student</span>
                      </h1>
                    </div>

                    <div className="flex flex-col gap-3 ">
                      <div className="flex items-center gap-6">
                        <p className="text-gray-400 text-xs">
                          Onboarding level
                        </p>
                        <p className="text-white text-xs font-medium">94%</p>
                      </div>

                      <div className="relative flex items-center justify-center h-3">
                        <div
                          className="w-full border border-white/50 h-full rounded-xs "
                          style={{
                            transform: "skewX(22deg)",
                          }}
                        >
                          <div
                            className="absolute left-0 z-10 w-[78%] rounded-tr-xs rounded-br-xs bg-white h-full"
                            style={{
                              transform: "skewX(1deg)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                {/* <PersonalDetails />

                <ProgramOfChoice />

                <LearningInformation />

                <StudentBadges />

                <UpcomingSession />

                <ProgramTeachers /> */}
              </div>

              <Button variant={"ghost"} width={"full"} className="text-red-500">
                Disable Student
              </Button>
            </div>
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  );
}

interface ProspectiveStudent {
  id: string;
  name: string;
  avatar: string;
  onboardingLevel: number;
  status: "active" | "inactive";
  leadSource: string;
  currentIntervention: string;
  timeOnPlatform: string;
  programInterest: string;
  lastContact: string;
  assignedManager: string;
  enrollmentDate: string;
  engagementScore: number;
  sessionCount: number;
  messagesCount: number;
}
