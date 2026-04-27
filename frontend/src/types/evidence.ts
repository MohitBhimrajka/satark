/**
 * Satark — EvidenceFile type mirroring app/schemas/evidence.py
 */

export interface EvidenceFile {
  id: string
  filename: string
  original_filename: string
  mime_type: string
  file_size: number
  uploaded_at: string
}
