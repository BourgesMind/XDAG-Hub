import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import cnTranslation from './cn/translation.json';
import enTranslation from './en/translation.json';
import frTranslation from './fr/translation.json';
import rsTranslation from './rs/translation.json';
import Browser from "webextension-polyfill";

export const supportLanguages:Record<string, string> = {
	"follow": "followSystem",
	"en": "English",
	"cn": "简体中文",
	"fr": "Français",
	"rs": "Pусский",
};


// 存储字符串值
export const setActiveLanguage = async ( language: string ) => {
	await Browser.storage.local.set( {
		activeLanguage: language
	} );
}

// 获取字符串值
export const getActiveLanguage = async ( language: string ) => {
	const { activeLanguage } = await Browser.storage.local.get( {
		activeLanguage: "en"
	} );
}


await i18next
	.use( initReactI18next )
	.init( {
		lng: "en", // if you're using a language detector, do not define the lng option
		debug: true,
		resources: {
			cn: { translation: cnTranslation },
			en: { translation: enTranslation },
			fr: { translation: frTranslation },
			rs: { translation: rsTranslation },
		},
		// if you see an error like: "Argument of type 'DefaultTFuncReturn' is not assignable to parameter of type xyz"
		// set returnNull to false (and also in the i18next.d.ts options)
		// returnNull: false,
	} );
// i18next.changeLanguage('cn')
// i18next.language



