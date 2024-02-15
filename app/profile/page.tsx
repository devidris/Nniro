"use client";
import useProfile from "#/hooks/useProfile";
import Spinner from "#/components/UI/Spinner";

const UserProfile = () => {
  const { data, isFetching: isLoading } = useProfile();
  console.log(data);
  return (
    <div>
      {isLoading && (
        // <Spinner />
        <></>
      )}
      {!isLoading && <div>User Profile</div>}
    </div>
  );
};

export default UserProfile;
