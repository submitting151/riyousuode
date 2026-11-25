(function(){
  // Set only to the backend's HTTPS origin after deployment; never put keys here.
  window.DIARY_API_BASE='https://riyousuode-preview-api.onrender.com';
  window.diaryCode=function(){if(!window.DIARY_API_BASE)return '';let code=sessionStorage.getItem('diary-preview-code');if(!code){code=prompt('请输入体验码，取消即可使用文字手动记录。');if(!code)throw new Error('需要体验码才能使用语音和 AI。');sessionStorage.setItem('diary-preview-code',code)}return code};
  window.diaryFetch=async function(path,opts){opts=opts||{};if(!window.DIARY_API_BASE)return fetch(path,opts);let code=window.diaryCode();let headers=new Headers(opts.headers||{});headers.set('X-Preview-Code',code);let response=await fetch(window.DIARY_API_BASE+path,{...opts,headers});if(response.status===403)sessionStorage.removeItem('diary-preview-code');return response};
})();

