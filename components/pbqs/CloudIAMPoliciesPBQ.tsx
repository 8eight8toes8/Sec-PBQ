
import React from 'react';
import GenericPBQ from './GenericPBQ';

interface Props {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const CloudIAMPoliciesPBQ: React.FC<Props> = ({ onComplete, onExit }) => {
  return (
    <GenericPBQ
      id="cloud_iam_policies"
      title="Cloud IAM Policy Auditing"
      scenario="Audit an IAM policy for a cloud storage bucket to ensure Least Privilege."
      objective="Identify the overly permissive setting in the JSON policy."
      questions={[
        {
          id: "q1",
          text: "The policy allows 'Action': 's3:*'. What is the risk?",
          options: [
            { value: "Full Access", label: "Grants full administrative control over S3" },
            { value: "Read Only", label: "Grants read-only access" },
            { value: "None", label: "No risk" },
            { value: "Upload", label: "Only allows uploads" }
          ],
          correctValue: "Full Access",
          feedback: "The wildcard '*' allows ALL actions, violating least privilege. Specific actions (e.g., s3:GetObject) should be used."
        },
        {
          id: "q2",
          text: "The policy allows 'Principal': '*'. What does this mean?",
          options: [
            { value: "Public", label: "Anyone on the internet can access the resource" },
            { value: "Admin", label: "Only Admins can access" },
            { value: "Internal", label: "Only internal users" },
            { value: "Root", label: "Root user only" }
          ],
          correctValue: "Public",
          feedback: "Principal '*' means anonymous/public access. This is a common cause of data leaks."
        },
        {
          id: "q3",
          text: "What is the best way to test if an IAM policy allows unintended access?",
          options: [
            { value: "Simulator", label: "Use an IAM Policy Simulator tool" },
            { value: "Wait", label: "Wait for a breach" },
            { value: "Guess", label: "Guess and check" },
            { value: "Email", label: "Email the provider" }
          ],
          correctValue: "Simulator",
          feedback: "Policy Simulators allow you to test permissions against hypothetical requests without risking live data."
        }
      ]}
      onComplete={onComplete}
      onExit={onExit}
    />
  );
};

export default CloudIAMPoliciesPBQ;
