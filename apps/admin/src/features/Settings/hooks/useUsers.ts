import {useQuery} from "@tanstack/react-query";
import {listUsers} from "../services/users.service";

export const useUsers = () => {
  const query = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listUsers(),
  });

  return {...query, users: query.data ?? []};
};
