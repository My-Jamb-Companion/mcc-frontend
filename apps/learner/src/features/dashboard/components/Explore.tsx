export default function Explore() {
  return (
    <div className="col-start-2 max-sm:col-start-1 pt-6">
      <div className="flex items-center gap-3">
        <div className="rounded-full h-14 w-14 bg-[#B190B6] overflow-hidden">
          <img
            src="/assets/images/profile.png"
            alt="profile image"
            className="w-full h-full"
          />
        </div>
        <div>
          <p className="text-muted font-medium">
            Good to have you,
            <span className="text-black"> Mac.</span>
          </p>
          <p className="text-btn-primary text-xs font-medium">
            Personalize your experience
          </p>
        </div>
      </div>
    </div>
  );
}
