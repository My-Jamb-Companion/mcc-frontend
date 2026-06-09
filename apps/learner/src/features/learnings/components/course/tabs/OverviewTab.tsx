import {Button, Icon} from "@mcc/ui";
import Image from "next/image";

export default function OverviewTab() {
  return (
    <section>
      <div className="space-y-4">
        <p className="text-2xl font-semibold">
          Pilates Teacher Training Certification 20 CPD Points
        </p>
        <div className="flex items-center gap-2">
          <Icon icon="solar:global-outline" size={14} className="text-muted" />
          <p className="textxs">English</p>
        </div>

        <div className="flex items-center gap-12">
          <div>
            <p className="text-sm flex items-center gap-1 font-semibold">
              4.6
              <Icon
                icon="tabler:star-filled"
                size={8}
                className="text-lime-500"
              />
            </p>
            <p className="text-xs">255 ratings</p>
          </div>

          <div>
            <p className="text-sm flex items-center gap-1 font-semibold">343</p>
            <p className="text-xs">Students</p>
          </div>

          <div>
            <p className="text-sm flex items-center gap-1 font-semibold">
              25 hours
            </p>
            <p className="text-xs">Total</p>
          </div>
        </div>

        <div className="flex items-center gap-1 py-7.5 border-b border-muted/30 ">
          <Icon
            icon="material-symbols:info-outline-rounded"
            size={14}
            className="text-muted"
          />
          <p className="text-sm">Last updated November 2025</p>
        </div>

        <div className="border-b border-muted/40 pb-5">
          <p className="font-medium pb-3">Certificates</p>
          <p className="text-muted text-xs">
            Get the MCC certificate by completeing the entire course
          </p>

          <Button
            variant="disabled"
            width="fit"
            radius="sm"
            className="mt-3 flex! bg-[#27272A]/14! cursor-not-allowed!"
            leftIcon={
              <Icon
                icon="line-md:file-download"
                size={16}
                className="text-hint"
              />
            }
          >
            MCC Certificate
          </Button>
        </div>

        <div className="border-b border-muted/40 pb-5">
          <p className="font-medium pb-3">Description</p>
          <p className="text-muted text-xs">
            Comprehensive Pilates Teacher Training Certification program
            designed to equip aspiring instructors with the knowledge and skills
            needed to teach Pilates with confidence. This course covers mat
            work, equipment-based exercises, anatomy, biomechanics, teaching
            methodologies, and ethical considerations.
          </p>
        </div>

        <div className="pb-5">
          <p className="font-medium pb-3">Instructor</p>
          <div className="flex items-center gap-2">
            <div className="h-[120px] w-[120px] rounded-2xl border border-muted/40 p-1">
              <div className="relative h-full w-full rounded-xl border border-muted/40 overflow-hidden">
                <Image
                  src="/assets/images/pencil.jpg"
                  alt="instructors avatar"
                  fill
                  className="object-cover object-top"
                />
              </div>
            </div>
            <div>
              <p className="font-medium text-sm pb-1">Benedict Laura</p>
              <p className="text-xs">Profession Pilates Instructor</p>

              <div className="flex items-center gap-2 pt-5">
                {["prime:twitter", "line-md:linkedin", "line-md:youtube"].map(
                  (i) => (
                    <button key={i} className="cursor-pointer">
                      <Icon icon={i} size={16} />
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
          <p className="text-muted text-xs pt-8">
            I’m Benedict Laura, I am a pilates instructor with passion for
            teaching. Im the founder of MCC pilates studio, a renowned hub for
            holistic wellness and movement education. With a decade of
            experience in the fitness industry, I have guided thousands of
            clients on their journey to strength, flexibility, and mindful
            living. My expertise spans classical Pilates, contemporary
            approaches, injury rehabilitation, and specialized prenatal and
            postnatal fitness. At MCC pilates, we believe in personalized care,
            fostering a supportive community, and empowering individuals to
            unlock their full potential through movement and movement education.
            Join us and discover the transformative power of Pilates!
          </p>
        </div>
      </div>
    </section>
  );
}
