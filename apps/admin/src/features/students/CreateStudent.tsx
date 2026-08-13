import {useState, useEffect, useRef} from "react";
import {Icon, motion, AnimatePresence, Button} from "@mcc/ui";
import {Controller, FormInputs, useForm} from "@mcc/features";

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateStudentFormValues {
  fullName: string;
  username: string;
  parentFullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  country: string;
  state: string;
  city: string;
  street: string;
}

const DEFAULT_VALUES: CreateStudentFormValues = {
  fullName: "",
  username: "",
  parentFullName: "",
  email: "",
  phoneNumber: "",
  gender: "",
  country: "",
  state: "",
  city: "",
  street: "",
};

export default function CreateStudentModal({
  isOpen,
  onClose,
}: CreateStudentModalProps) {
  // The avatar upload isn't a registered form field (it's a raw <input type="file">
  // driving a data-URL preview), so it stays in its own bit of local state
  // instead of going through react-hook-form.
  const [image, setImage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: {errors},
  } = useForm<CreateStudentFormValues>({defaultValues: DEFAULT_VALUES});

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const inpRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      if (typeof reader.result === "string") setImage(reader.result);
    };
  };

  const onSubmit = (values: CreateStudentFormValues) => {
    console.log("Form submitted:", {...values, image});
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.2}}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          />

          {/* Slide-over Drawer Panel */}
          <motion.section
            initial={{x: "100%", opacity: 0}}
            animate={{x: 0, opacity: 1}}
            exit={{x: "100%", opacity: 0}}
            transition={{type: "tween", duration: 0.3}}
            className="fixed top-0 right-0 z-50 h-screen w-full max-w-150 bg-white p-6 shadow-2xl overflow-y-auto"
          >
            <div className="flex flex-col gap-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-muted/20">
                <h2 className="text-lg font-semibold text-gray-900">
                  Create student
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-full py-1 px-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  aria-label="Close panel"
                >
                  <Icon icon="lucide:x" size={20} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Banner with Profile Photo */}
                <div className="relative w-full h-44 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 rounded-2xl flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute -left-6 bottom-2 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  <div className="absolute right-4 top-2 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10">
                    <img
                      src={
                        image ||
                        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&glasses=eyepatch"
                      }
                      alt="Avatar"
                      className="w-20 h-20 rounded-full border-2 border-white/80 object-cover bg-purple-200"
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={inpRef}
                    onChange={handleImageChange}
                  />
                  <button
                    type="button"
                    onClick={() => inpRef.current?.click()}
                    className="relative z-10 mt-2 text-white/90 text-sm font-medium flex items-center gap-1.5 hover:text-white transition"
                  >
                    <Icon icon="lucide:refresh-cw" size={14} />
                    <span>Replace photo</span>
                  </button>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-700">
                    Personal Information
                  </h3>

                  {/* Row 1: Full Name, Username, Parent Name */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInputs
                      label="Full name"
                      placeholder="Enter full name"
                      registration={register("fullName", {
                        required: "Full name is required",
                      })}
                      errors={errors.fullName}
                    />
                    <FormInputs
                      label="Username"
                      placeholder="Enter full username"
                      registration={register("username", {
                        required: "Username is required",
                      })}
                      errors={errors.username}
                    />
                    <FormInputs
                      label="Parent full name"
                      placeholder="Enter parent's name"
                      registration={register("parentFullName")}
                      errors={errors.parentFullName}
                    />
                  </div>

                  {/* Row 2: Email & Phone Number */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInputs
                      type="email"
                      label="Email Address"
                      placeholder="oa@mail.com"
                      registration={register("email", {
                        required: "Email is required",
                      })}
                      errors={errors.email}
                    />
                    <FormInputs
                      type="tel"
                      label="Phone Number"
                      placeholder="812 345 6789"
                      registration={register("phoneNumber")}
                      errors={errors.phoneNumber}
                    />
                  </div>

                  {/* Row 3: Gender Select */}
                  <Controller
                    control={control}
                    name="gender"
                    rules={{
                      required: "Gender is required",
                    }}
                    render={({field}) => (
                      <FormInputs
                        type="select"
                        label="Your Gender"
                        placeholder="Select gender"
                        value={field.value}
                        onChange={field.onChange}
                        errors={errors.gender}
                        options={[
                          {label: "Male", value: "male"},
                          {label: "Female", value: "female"},
                          {label: "Other", value: "other"},
                        ]}
                      />
                    )}
                  />
                </div>

                {/* Location Details */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-base font-semibold text-gray-700">
                    Location Details
                  </h3>

                  {/* Row 1: Country, State, City */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Controller
                      control={control}
                      name="country"
                      rules={{
                        required: "Country is required",
                      }}
                      render={({field}) => (
                        <FormInputs
                          type="select"
                          label="Your Country"
                          placeholder="Select country"
                          value={field.value}
                          onChange={field.onChange}
                          errors={errors.country}
                          icon="circle-flags:ng"
                          options={[
                            {label: "Nigeria", value: "Nigeria"},
                            {label: "Ghana", value: "Ghana"},
                            {label: "Kenya", value: "Kenya"},
                          ]}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="state"
                      rules={{
                        required: "State is required",
                      }}
                      render={({field}) => (
                        <FormInputs
                          type="select"
                          label="Your State"
                          placeholder="Select state"
                          value={field.value}
                          onChange={field.onChange}
                          errors={errors.state}
                          options={[
                            {label: "Lagos state", value: "Lagos state"},
                            {label: "Abuja", value: "Abuja"},
                            {label: "Oyo state", value: "Oyo state"},
                          ]}
                        />
                      )}
                    />

                    <FormInputs
                      label="Your city"
                      placeholder="Ikeja"
                      registration={register("city")}
                      errors={errors.city}
                    />
                  </div>

                  {/* Row 2: Street Input */}
                  <div>
                    <FormInputs
                      label="Your Street"
                      placeholder="Enter your street name"
                      registration={register("street")}
                      errors={errors.street}
                    />
                    <span className="text-xs text-gray-400 mt-1 block">
                      Optional
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    width={"full"}
                    leftIcon={<Icon icon="ri:add-line" />}
                  >
                    Create student
                  </Button>
                </div>
              </form>
            </div>
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  );
}
