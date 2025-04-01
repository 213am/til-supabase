"use server";

import { Provider } from "@supabase/supabase-js";
import { createServerSideClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const signInWith = (provider: Provider) => async () => {
  const supabase = await createServerSideClient();

  const auth_callback_url = `${process.env.SITE_URL}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: auth_callback_url,
    },
  });

  console.log(data);

  if (error) {
    console.log(error);
  }

  redirect(data.url as string);
};

// 구글 로그인
const signInWithGoogle = signInWith("google");
// 카카오 로그인
const signInWithKakao = signInWith("kakao");

const signOut = async () => {
  const supabase = await createServerSideClient();
  await supabase.auth.signOut();
};

export { signInWithGoogle, signInWithKakao, signOut };
