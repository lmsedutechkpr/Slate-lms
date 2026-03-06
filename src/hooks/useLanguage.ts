'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { translate, type Lang } from '@/lib/i18n/translations';

export function useLanguage() {
  const [lang, setLangState] = useState<Lang>('en');
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles')
        .select('preferred_language')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.preferred_language === 'ta') setLangState('ta');
        });
    });
  }, []);

  async function setLang(newLang: Lang) {
    setLangState(newLang);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles')
        .update({ preferred_language: newLang })
        .eq('id', user.id);
    }
  }

  const tr = (key: string) => translate(key, lang);

  return { lang, setLang, tr };
}
