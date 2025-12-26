import { UpdateUserSettingsInput } from '@/lib/schemas/user';
import { updateUserSettings } from '@/modules/user/user.actions';
import { message } from 'antd';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function useUserGoals() {
	const [loading, setLoading] = useState(false);
	const tCommon = useTranslations('Common');

	const updateGoals = async (values: UpdateUserSettingsInput) => {
		setLoading(true);
		try {
			const result = await updateUserSettings(values);
			if (result.success) {
				message.success(tCommon('saveSuccess'));
				return true;
			} else {
				message.error(result.error || tCommon('saveError'));
				return false;
			}
		} catch (error) {
			console.error('Failed to update goals:', error);
			message.error(tCommon('error'));
			return false;
		} finally {
			setLoading(false);
		}
	};

	return { updateGoals, loading };
}
