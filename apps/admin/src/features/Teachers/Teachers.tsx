"use client";

import {Button, Icon, motion, Variants} from "@mcc/ui";
import {useState} from "react";

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  avatar?: string;
  status: "active" | "inactive";
  schedule?: string;
}

const DUMMY_TEACHERS: Teacher[] = [
  {
    id: 1,
    name: "Prof. Adewale Martins",
    email: "[EMAIL_ADDRESS]",
    phone: "+234 803 111 2222",
    subject: "Python & Data Science",
    avatar: "https://i.pravatar.cc/150?img=12",
    status: "active",
    schedule: "Mon, Tue, Thu",
  },
  {
    id: 2,
    name: "Dr. Ngozi Okonkwo",
    email: "[EMAIL_ADDRESS]",
    phone: "+234 905 666 3333",
    subject: "Web Development",
    avatar: "https://i.pravatar.cc/150?img=13",
    status: "active",
    schedule: "Mon, Wed, Fri",
  },
  {
    id: 3,
    name: "Mr. John Adebayo",
    email: "[EMAIL_ADDRESS]",
    phone: "+234 810 222 4444",
    subject: "Mobile Development",
    avatar: "https://i.pravatar.cc/150?img=14",
    status: "inactive",
    schedule: "Not Set",
  },
  {
    id: 4,
    name: "Mrs. Chidinma Okafor",
    email: "[EMAIL_ADDRESS]",
    phone: "+234 703 444 5555",
    subject: "Digital Marketing",
    avatar: "https://i.pravatar.cc/150?img=15",
    status: "active",
    schedule: "Tue, Thu, Sat",
  },
  {
    id: 5,
    name: "Mr. David Okoro",
    email: "[EMAIL_ADDRESS]",
    phone: "+234 901 777 8888",
    subject: "UX/UI Design",
    avatar: "https://i.pravatar.cc/150?img=16",
    status: "active",
    schedule: "Mon, Wed, Fri",
  },
];

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>(DUMMY_TEACHERS);
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);

  const containerVariants = {
    initial: {opacity: 0},
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    initial: {opacity: 0, y: 12},
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 16,
      },
    },
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Teachers Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage instructor profiles and teaching schedules
          </p>
        </div>
        <Button
        //   onClick={() => openModal()}
        >
          <Icon icon="lucide:plus" size={18} />
          <span>Add New Teacher</span>
        </Button>
      </div>

      {/* Teachers List */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {teachers.map((teacher, index) => (
          <motion.div
            key={teacher.id}
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={
                      teacher.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.name}`
                    }
                    alt={teacher.name}
                    className="w-16 h-16 rounded-xl border-2 border-gray-100 object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1">
                    <div className="w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base">
                    {teacher.name}
                  </h3>
                  <p className="text-xs text-primary-600 font-medium">
                    {teacher.subject}
                  </p>
                </div>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  teacher.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {teacher.status}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:mail" size={15} className="text-gray-400" />
                <span className="truncate">{teacher.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:phone" size={15} className="text-gray-400" />
                <div className="flex items-center gap-1">
                  <span>{isPhoneRevealed ? teacher.phone : "••••••••••"}</span>
                  <button
                    onClick={() => setIsPhoneRevealed(!isPhoneRevealed)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Icon
                      icon={isPhoneRevealed ? "lucide:eye-off" : "lucide:eye"}
                      size={14}
                    />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Icon
                  icon="lucide:calendar"
                  size={15}
                  className="text-gray-400"
                />
                <span>{teacher.schedule || "Not Set"}</span>
              </div>
            </div>

            {/* Edit Button */}
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                // onClick={() => openModal()}
                className="w-full text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-primary-600"
              >
                <Icon icon="lucide:edit" size={14} className="mr-2" />
                Edit Profile
              </Button>
            </div>
          </motion.div>
        ))}

        {/* Add Teacher Placeholder (if you want one, or just show the button above) */}
      </motion.div>

      {/* Add Teacher Modal */}
      {/* <AddTeacherForm /> */}
    </div>
  );
}
