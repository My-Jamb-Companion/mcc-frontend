import {useCallback} from "react";
import {useFormContext} from "@mcc/features";
import {QueryClient, useQueryClient} from "@tanstack/react-query";
import {updateExamProgramContent, UpdateExamProgramContentPayload} from "../services/exam.service";
import {withBaseVersion} from "../helper/contentSave";

/**
 * Saves a program's content tree. Every content save goes through here, so each one:
 *  - sends the content version the editor holds, so a save from an out-of-date copy is refused (not applied over newer work);
 *  - keeps the editor's version in step with the server's after a save, so the next save is made from it;
 *  - refreshes the program queries, so no page shows (or starts an editor from) the content as it was before.
 */
export type VersionForm = {
  getValues: (name: "contentVersion") => number | null | undefined;
  setValue: (name: "contentVersion", value: number, options?: {shouldDirty?: boolean}) => void;
};

/** What a content save does, apart from React: send the version held, keep the one returned, refresh the queries. */
export async function saveProgramContent(
  deps: {form: VersionForm; queryClient: Pick<QueryClient, "invalidateQueries">; update?: typeof updateExamProgramContent},
  programId: string,
  payload: UpdateExamProgramContentPayload,
) {
  const {form, queryClient, update = updateExamProgramContent} = deps;
  const result = await update(programId, withBaseVersion(payload, form.getValues("contentVersion")));
  if (typeof result.content_version === "number") {
    form.setValue("contentVersion", result.content_version, {shouldDirty: false});
  }
  queryClient.invalidateQueries({queryKey: ["exam-program"]});
  queryClient.invalidateQueries({queryKey: ["exam-programs"]});
  return result;
}

/**
 * `form` is the wizard's own form when this is used by the component that creates the form (it is not inside its own
 * provider yet); anywhere below the provider the form comes from context.
 */
export function useSaveProgramContent(form?: VersionForm) {
  const context = useFormContext<{contentVersion?: number | null}>() as unknown as VersionForm | null;
  const target = (form ?? context) as VersionForm;
  const queryClient = useQueryClient();

  return useCallback(
    (programId: string, payload: UpdateExamProgramContentPayload) => saveProgramContent({form: target, queryClient}, programId, payload),
    [target, queryClient],
  );
}
