import {
  ApiAttachment,
  uploadAttachment,
} from "../services/brainy.service";

/**
 * Turns picked files into the extracted text the chat endpoint expects.
 *
 * Uploads are sequential on purpose: the backend rejects an unsupported type
 * with a 400 whose message names what to use instead, and failing on the
 * first one gives the student a single clear error rather than a pile of
 * parallel ones.
 *
 * Throws on the first failure so callers can surface the backend's message
 * and abort the send -- asking the model about a document it never received
 * would be worse than not sending at all.
 */
export async function uploadAttachments(
  files: File[] | undefined,
): Promise<ApiAttachment[]> {
  if (!files?.length) return [];

  const extracted: ApiAttachment[] = [];
  for (const file of files) {
    const result = await uploadAttachment(file);
    extracted.push({filename: result.filename, text: result.text});
  }
  return extracted;
}
