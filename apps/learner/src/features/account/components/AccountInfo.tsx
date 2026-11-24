import {useForm, Controller, FormInputs} from "@mcc/features";
import {Icon, showError} from "@mcc/ui";
import {ProfileUser} from "../constants/types";
import {useLinkedParent} from "../hooks/useProfile";
import {COUNTRY_OPTIONS, PHONE_CODE_OPTIONS} from "../constants/countries";
import {composePhone} from "../helper/phone";

export interface PersonalInformationFormValues {
  fullName: string;
  username: string;
  parentName: string;
  email: string;
  /** ISO code of the phone number's country ("NG"). */
  phoneCountry: string;
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
  /** A save is in progress: the button says so and cannot be pressed again. */
  saving?: boolean;
}

const GENDER_OPTIONS = [
  {label: "Male", value: "Male"},
  {label: "Female", value: "Female"},
];

export function AccountPersonalInformationForm({
  user,
  onSave,
  saving = false,
}: PersonalInformationFormProps) {
  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: {errors},
  } = useForm<PersonalInformationFormValues>({
    defaultValues: {
      fullName: user.fullName,
      username: user.username,
      parentName: user.parentName,
      email: user.email,
      phoneCountry: user.phoneCountry,
      phoneNumber: user.phoneNumber,
      // An option that is no longer offered ("Prefer not to say") shows as unchosen.
      gender: GENDER_OPTIONS.some((o) => o.value === user.gender) ? user.gender : "",
      country: user.country,
      state: user.state,
      city: user.city,
      street: user.street,
    },
  });

  // On a phone the field that is wrong may be off screen, so a save that cannot go ahead says so.
  const submit = handleSubmit(
    (values) => onSave?.(values),
    () => showError("Some details are missing or not valid. Please check the highlighted fields."),
  );
  const {data: linkedParent} = useLinkedParent();

  return (
    <form className="flex-1" onSubmit={submit}>
      <h3 className="text-base font-bold text-foreground">
        Personal Information
      </h3>

      {linkedParent?.linked && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-muted/20 bg-muted/5 px-3 py-2 text-sm text-subtle">
          <Icon icon="lucide:link" size={14} className="shrink-0 text-primary" />
          <span>
            Linked to parent account{" "}
            <span className="font-medium text-foreground">
              {linkedParent.parent_name ?? linkedParent.parent_email}
            </span>
          </span>
        </div>
      )}

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
            name="phoneCountry"
            control={control}
            render={({field}) => (
              <FormInputs
                label="Code"
                type="select"
                searchable
                options={PHONE_CODE_OPTIONS}
                value={field.value}
                onChange={(v) => field.onChange(v)}
                className="w-32"
              />
            )}
          />
          <FormInputs
            className="translate-y-1"
            label="Phone Number"
            type="tel"
            registration={register("phoneNumber", {
              required: "Phone number is required",
              validate: (v) =>
                composePhone(getValues("phoneCountry"), v) !== null || "Enter a valid phone number",
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

      <h3 className="mt-6 text-base font-bold text-foreground">
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
              searchable
              options={COUNTRY_OPTIONS}
              value={field.value}
              onChange={(v) => field.onChange(v)}
            />
          )}
        />
        <FormInputs
          label="Your State"
          placeholder="Enter your state"
          registration={register("state")}
          errors={errors.state}
        />
        <FormInputs
          label="Your City"
          placeholder="Enter your city"
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
        <p className="mt-1 text-[11px] text-muted">Optional</p>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-6 w-full rounded-lg bg-linear-to-r from-violet-600 to-fuchsia-500 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
