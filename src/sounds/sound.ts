import { useCallback, useEffect } from 'react';
import { db, useUserSettingsSub } from '../database';
import MaterialSounds from './material-sounds';
import { Howl } from 'howler';
export const useSound = () => {
	const userSettings = useUserSettingsSub(db);
    const { data } = userSettings;
	const appVolumn = data?.volumn !== undefined ? data.volumn :  50;
	const soundCreator = useCallback((soundFile: string) => () => {
		const sound = new Howl({
			src: [soundFile],
			volume: appVolumn / 100,
		});
		return sound;
	},[appVolumn]);



	return {
		volumn: appVolumn,
		sounds: MaterialSounds,
		play: (soundFile: string) => {
			const sound = new Howl({
				src: [soundFile],
				volume: appVolumn / 100,
			});
			sound.play();
		},
		decorativeCelebrate01: soundCreator(MaterialSounds.HeroSounds.HeroDecorativeCelebration01),
		decorativeCelebrate02: soundCreator(MaterialSounds.HeroSounds.HeroDecorativeCelebration02),
		decorativeCelebrate03: soundCreator(MaterialSounds.HeroSounds.HeroDecorativeCelebration03),
		simpleCelebrate01: soundCreator(MaterialSounds.HeroSounds.HeroSimpleCelebration01),
		simpleCelebrate02: soundCreator(MaterialSounds.HeroSounds.HeroSimpleCelebration02),
		simpleCelebrate03: soundCreator(MaterialSounds.HeroSounds.HeroSimpleCelebration03),
		alarmGentle: soundCreator(MaterialSounds.AlertsAndNotifications.AlarmGentle),
		alertIntense: soundCreator(MaterialSounds.AlertsAndNotifications.AlertHighIntensity),
		alertSimple: soundCreator(MaterialSounds.AlertsAndNotifications.AlertSimple),
		notificationAmbient: soundCreator(MaterialSounds.AlertsAndNotifications.NotificationAmbient),
		notificationDecorative01: soundCreator(MaterialSounds.AlertsAndNotifications.NotificationDecorative01),
		notificationDecorative02: soundCreator(MaterialSounds.AlertsAndNotifications.NotificationDecorative02),
		notificationHighIntensity: soundCreator(MaterialSounds.AlertsAndNotifications.NotificationHighIntensity),
		notificationSimple01: soundCreator(MaterialSounds.AlertsAndNotifications.NotificationSimple01),
		notificationSimple02: soundCreator(MaterialSounds.AlertsAndNotifications.NotificationSimple02),
		ringtoneSimple: soundCreator(MaterialSounds.AlertsAndNotifications.RingtoneSimple),
		navBackwardSelection: soundCreator(MaterialSounds.PrimarySystemSounds.NavigationBackwardSelection),
		navBackwardSelectionMinimal: soundCreator(
			MaterialSounds.PrimarySystemSounds.NavigationBackwardSelectionMinimal,
		),
		navForwardSelection: soundCreator(MaterialSounds.PrimarySystemSounds.NavigationForwardSelection),
		navForwardSelectionMinimal: soundCreator(MaterialSounds.PrimarySystemSounds.NavigationForwardSelectionMinimal),
		navHoverTap: soundCreator(MaterialSounds.PrimarySystemSounds.NavigationHoverTap),
		navSelectionCompleteCelebration: soundCreator(
			MaterialSounds.PrimarySystemSounds.NavigationSelectionCompleteCelebration,
		),
		stateChangeConfirmDown: soundCreator(MaterialSounds.PrimarySystemSounds.StateChangeConfirmDown),
		stateChangeConfirmUp: soundCreator(MaterialSounds.PrimarySystemSounds.StateChangeConfirmUp),
		uiCameraShutter: soundCreator(MaterialSounds.PrimarySystemSounds.UiCameraShutter),
		uiLock: soundCreator(MaterialSounds.PrimarySystemSounds.UiLock),
		uiTapVariant01: soundCreator(MaterialSounds.PrimarySystemSounds.UiTapVariant01),
		uiTapVariant02: soundCreator(MaterialSounds.PrimarySystemSounds.UiTapVariant02),
		uiTapVariant03: soundCreator(MaterialSounds.PrimarySystemSounds.UiTapVariant03),
		uiTapVariant04: soundCreator(MaterialSounds.PrimarySystemSounds.UiTapVariant04),
		uiUnlock: soundCreator(MaterialSounds.PrimarySystemSounds.UiUnlock),
		alertError01: soundCreator(MaterialSounds.SecondarySystemSounds.AlertError01),
		alertError02: soundCreator(MaterialSounds.SecondarySystemSounds.AlertError02),
		alertError03: soundCreator(MaterialSounds.SecondarySystemSounds.AlertError03),
		navTransitionLeft: soundCreator(MaterialSounds.SecondarySystemSounds.NavigationTransitionLeft),
		navTransitionRight: soundCreator(MaterialSounds.SecondarySystemSounds.NavigationTransitionRight),
		navUnavailableSelection: soundCreator(MaterialSounds.SecondarySystemSounds.NavigationUnavailableSelection),
		navCancel: soundCreator(MaterialSounds.SecondarySystemSounds.NavigationCancel),
		uiLoading: soundCreator(MaterialSounds.SecondarySystemSounds.UiLoading),
		uiRefreshFeed: soundCreator(MaterialSounds.SecondarySystemSounds.UiRefreshFeed),
	};
};
