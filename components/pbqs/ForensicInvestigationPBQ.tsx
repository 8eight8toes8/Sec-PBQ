
import React from 'react';
import GenericPBQ from './GenericPBQ';

interface Props {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const ForensicInvestigationPBQ: React.FC<Props> = ({ onComplete, onExit }) => {
  return (
    <GenericPBQ
      id="forensic_investigation"
      title="Digital Forensics Investigation"
      scenario="You are collecting evidence from a compromised workstation. Adherence to the order of volatility and chain of custody is critical."
      objective="Prioritize evidence collection based on the Order of Volatility."
      questions={[
        {
          id: "q1",
          text: "Which data source is the MOST volatile and should be collected first?",
          options: [
            { value: "RAM", label: "CPU Cache / RAM" },
            { value: "HDD", label: "Hard Disk Drive" },
            { value: "Logs", label: "Remote Logs" },
            { value: "Archive", label: "Archived Backups" }
          ],
          correctValue: "RAM",
          feedback: "CPU registers, cache, and RAM are the most volatile and are lost when power is removed."
        },
        {
          id: "q2",
          text: "After collecting volatile memory, what is the next most volatile source?",
          options: [
            { value: "Swap", label: "Swap File / Paging File" },
            { value: "DVD", label: "DVD-ROM" },
            { value: "Paper", label: "Printed Documents" },
            { value: "Tape", label: "Tape Backup" }
          ],
          correctValue: "Swap",
          feedback: "Swap/Paging files are temporary storage on disk that can change rapidly."
        },
        {
          id: "q3",
          text: "To ensure evidence has not been tampered with after collection, you must:",
          options: [
            { value: "Hash", label: "Generate a cryptographic hash of the image" },
            { value: "Encrypt", label: "Encrypt the image" },
            { value: "Compress", label: "Compress the image" },
            { value: "Print", label: "Print the file list" }
          ],
          correctValue: "Hash",
          feedback: "Hashing (e.g., MD5, SHA-256) provides a digital fingerprint to verify integrity."
        }
      ]}
      onComplete={onComplete}
      onExit={onExit}
    />
  );
};

export default ForensicInvestigationPBQ;
