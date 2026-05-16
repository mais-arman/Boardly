import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../../shared/components/Button";
import Input from "../../../../shared/components/Input";
import type { ManageableBoardRole } from "../../types";

type InviteMemberFormProps = {
  email: string;
  role: ManageableBoardRole;
  roleOptions: ManageableBoardRole[];
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onRoleChange: (value: ManageableBoardRole) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function InviteMemberForm({
  email,
  role,
  roleOptions,
  isLoading,
  onEmailChange,
  onRoleChange,
  onSubmit,
}: InviteMemberFormProps) {
  const { t } = useTranslation();

  return (
    <form className="invite-form" onSubmit={onSubmit}>
      <Input
        id="invite-email"
        label={t("members.inviteByEmail")}
        type="email"
        placeholder="teammate@example.com"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        required
      />

      <div className="field-group">
        <label htmlFor="invite-role">{t("profile.role")}</label>

        <select
          id="invite-role"
          value={role}
          onChange={(event) =>
            onRoleChange(event.target.value as ManageableBoardRole)
          }
        >
          {roleOptions.map((item) => (
            <option key={item} value={item}>
              {t(`roles.${item}`)}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" fullWidth isLoading={isLoading}>
        {t("members.sendInvitation")}
      </Button>
    </form>
  );
}