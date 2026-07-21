import {useForm, Controller, FormInputs} from "@mcc/features";
import {ProfileUser} from "../constants/types";

export interface PersonalInformationFormValues {
  fullName: string;
  username: string;
  parentName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  gender: string;
  country: string;
  state: string;
  city: string;
  street: string;
}

interface PersonalInformationFormProps {
  user: ProfileUser;
  onSave?: (values: PersonalInformationFormValues) => void;
}

const GENDER_OPTIONS = [
  {label: "Male", value: "Male"},
  {label: "Female", value: "Female"},
  {label: "Prefer not to say", value: "Prefer not to say"},
];

const COUNTRY_OPTIONS = [
  {label: "🇳🇬 Nigeria", value: "Nigeria"},
  {label: "Ghana", value: "Ghana"},
  {label: "Kenya", value: "Kenya"},
];

const STATE_OPTIONS = [
  {label: "Lagos state", value: "Lagos state"},
  {label: "Ogun state", value: "Ogun state"},
  {label: "Oyo state", value: "Oyo state"},
];

const PHONE_CODE_OPTIONS = [
  {label: "🇳🇬 +234", value: "+234"},
  {label: "🇬🇭 +233", value: "+233"},
  {label: "🇰🇪 +254", value: "+254"},
];

export function AccountPersonalInformationForm({
  user,
  onSave,
}: PersonalInformationFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<PersonalInformationFormValues>({
    defaultValues: {
      fullName: user.fullName,
      username: user.username,
      parentName: user.parentName,
      email: user.email,
      phoneCountryCode: user.phoneCountryCode,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      country: user.country,
      state: user.state,
      city: user.city,
      street: user.street,
    },
  });

  const submit = handleSubmit((values) => onSave?.(values));

  return (
    <form className="flex-1" onSubmit={submit}>
      <h3 className="text-base font-bold text-gray-900">
        Personal Information
      </h3>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormInputs
          label="Full Name"
          registration={register("fullName", {
            required: "Full name is required",
          })}
          errors={errors.fullName}
        />
        <FormInputs
          label="Username"
          registration={register("username", {
            required: "Username is required",
          })}
          errors={errors.username}
        />
        <FormInputs
          label="Parent name"
          registration={register("parentName")}
          errors={errors.parentName}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormInputs
          label="Email Address"
          type="email"
          registration={register("email", {required: "Email is required"})}
          errors={errors.email}
        />

        <div className="grid grid-cols-[auto_1fr] gap-2">
          <Controller
            name="phoneCountryCode"
            control={control}
            render={({field}) => (
              <FormInputs
                label="Code"
                type="select"
                options={PHONE_CODE_OPTIONS}
                value={field.value}
                onChange={(v) => field.onChange(v)}
                className="w-24"
              />
            )}
          />
          <FormInputs
            className="translate-y-1"
            label="Phone Number"
            type="tel"
            registration={register("phoneNumber", {
              required: "Phone number is required",
            })}
            errors={errors.phoneNumber}
          />
        </div>

        <Controller
          name="gender"
          control={control}
          render={({field}) => (
            <FormInputs
              label="Your Gender"
              type="select"
              options={GENDER_OPTIONS}
              value={field.value}
              onChange={(v) => field.onChange(v)}
            />
          )}
        />
      </div>

      <h3 className="mt-6 text-base font-bold text-gray-900">
        Manage Location
      </h3>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Controller
          name="country"
          control={control}
          render={({field}) => (
            <FormInputs
              label="Your Country"
              type="select"
              options={COUNTRY_OPTIONS}
              value={field.value}
              onChange={(v) => field.onChange(v)}
            />
          )}
        />
        <Controller
          name="state"
          control={control}
          render={({field}) => (
            <FormInputs
              label="Your State"
              type="select"
              options={STATE_OPTIONS}
              value={field.value}
              onChange={(v) => field.onChange(v)}
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

      <div className="mt-4 max-w-sm">
        <FormInputs
          label="Your Street"
          placeholder="Enter your street name"
          registration={register("street")}
          errors={errors.street}
        />
        <p className="mt-1 text-[11px] text-gray-400">Optional</p>
      </div>

      <button
        type="submit"
        className="mt-6 w-full rounded-lg bg-linear-to-r from-violet-600 to-fuchsia-500 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
      >
        Save Changes
      </button>
    </form>
  );
}
