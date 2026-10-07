
(function(){
  var SB_URL='https://inrvprlyobghviklulcv.supabase.co';
  var SB_KEY='sb_publishable_ZrCNcsRHMci-l7Fns8QtIA_X22XZGJp';
  var qs=new URLSearchParams(location.search);
  var SRC=qs.get('src')||'chibatv-1007';
  var DEMO=qs.get('demo')==='1';
  function $(id){return document.getElementById(id);}


  var reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function focusSection(el){
    el.focus({preventScroll:true});
    var rect=el.getBoundingClientRect();
    if(rect.top<110||rect.top>window.innerHeight-150) el.scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'start'});
  }
  if(DEMO){
    var banner=document.createElement('div'); banner.className='preview-banner';
    banner.textContent='プレビュー表示です。お申し込み内容は送信されません。';
    document.querySelector('main').prepend(banner);
  }
  /* ---------- diagnosis state ---------- */
  var Q=Array.from(document.querySelectorAll('#quiz .q'));
  var A={}; var i=0; var DIAG=null;
  var PRICE_MID={'5万円未満':30000,'5万〜20万円未満':120000,'20万〜50万円未満':350000,'50万円〜':500000};
  function show(n,focus){
    i=Math.max(0,Math.min(Q.length-1,n));
    Q.forEach(function(q,k){q.classList.toggle('on',k===i);});
    $('pbar').style.width=((i+1)/Q.length*100)+'%';
    $('pbar').parentElement.setAttribute('aria-valuenow',String(i+1));
    $('pnum').textContent='全'+Q.length+'問中、'+(i+1)+'問目';
    $('q-current').textContent=String(i+1).padStart(2,'0');
    $('prev').disabled=i===0;
    $('next').textContent=i===Q.length-1?'結果を見る →':'次へ →';
    $('selection-help').textContent=cur().querySelector('input')?'人数を入力するか「把握していない」を選んでください。':'あてはまるものを1つお選びください。';
    $('quiz-error').textContent='';
    syncNext();
    if(focus) focusSection(cur().querySelector('h3'));
  }
  function cur(){return Q[i];}
  function key(){return cur().getAttribute('data-q');}
  function answered(){var k=key(); return A[k]!==undefined && A[k]!=='' && A[k]!==null;}
  function numericError(k){
    var v=A[k];
    if(typeof v!=='number') return '';
    if(!Number.isFinite(v)||v<0||!Number.isInteger(v)||v>10000000) return '0〜10,000,000の範囲で、整数をご入力ください。';
    if(k==='meet'&&typeof A.leads==='number'&&v>A.leads) return '面談人数が見込み客数を上回っています。同じ期間・同じ対象の数字をご確認ください。';
    if(k==='close'&&typeof A.meet==='number'&&v>A.meet) return '成約件数が面談人数を上回っています。同じ期間・同じ対象の数字をご確認ください。';
    if(k==='close'&&typeof A.leads==='number'&&v>A.leads) return '成約件数が見込み客数を上回っています。同じ期間・同じ対象の数字をご確認ください。';
    return '';
  }
  function syncNext(){
    var err=numericError(key());
    $('quiz-error').textContent=err;
    var inp=cur().querySelector('input');
    if(inp) inp.setAttribute('aria-invalid',err?'true':'false');
    $('next').disabled=!answered()||Boolean(err);
  }
  function goNext(){
    if(!answered()||numericError(key())) return;
    if(i<Q.length-1) show(i+1,true);
    else {
      for(var n=0;n<Q.length;n++){
        var k=Q[n].dataset.q;
        if(A[k]===undefined||numericError(k)){show(n,true);return;}
      }
      finish();
    }
  }
  Q.forEach(function(q){
    var k=q.dataset.q;
    q.querySelectorAll('.opt').forEach(function(b){
      b.addEventListener('click',function(){
        q.querySelectorAll('.opt').forEach(function(x){x.classList.remove('sel');x.setAttribute('aria-pressed','false');});
        b.classList.add('sel');b.setAttribute('aria-pressed','true');
        A[k]=b.dataset.v;DIAG=null;
        var inp=q.querySelector('input'); if(inp){inp.value='';}
        syncNext();
      });
    });
    var inp=q.querySelector('input');
    if(inp){
      inp.addEventListener('input',function(){
        q.querySelectorAll('.opt').forEach(function(x){x.classList.remove('sel');x.setAttribute('aria-pressed','false');});
        var v=inp.value.trim(); A[k]=v===''?undefined:Number(v);DIAG=null; syncNext();
      });
      inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();goNext();}});
    }
  });
  $('next').addEventListener('click',goNext);
  $('prev').addEventListener('click',function(){show(i-1,true);});
  function reopen(){ $('result').classList.remove('on'); $('quiz').style.display=''; $('quiz-privacy').hidden=false; show(0,true); }
  $('redo').addEventListener('click',function(){
    A={};DIAG=null;
    Q.forEach(function(q){q.querySelectorAll('.opt').forEach(function(x){x.classList.remove('sel');x.setAttribute('aria-pressed','false');});});
    document.querySelectorAll('#quiz input').forEach(function(x){x.value='';x.removeAttribute('aria-invalid');});
    reopen();
  });
  $('edit-answers').addEventListener('click',reopen);
  show(0,false);

  /* ---------- scoring ---------- */
  var STAGES=[
    {k:'sekkei',nm:'設計',en:'FUNNEL'},
    {k:'haishin',nm:'配信',en:'NURTURING'},
    {k:'shinri',nm:'心理',en:'PSYCHOLOGY'},
    {k:'mendan',nm:'面談',en:'CLOSING'},
    {k:'horiokoshi',nm:'掘り起こし',en:'RE-ENGAGE'}
  ];
  var CUL={
    sekkei:{t:'矢印に、まだ数字が置けていません',why:'置けない矢印が「見えていない場所」です。多くの会社で、登録と面談のあいだが誰の仕事でもなくなり、そこでリストが眠ります。数字がないと、直す順番も決められません。',step:'登録→面談、面談→成約。この2つの率を、今週出す',proof:'<b>S社</b>（女性向けキャリアスクール）：登録後の体験を組み直し、面談予約 <b>240名/月 → 929名/月</b>（導入半年）。広告費は増やしていません。'},
    haishin:{t:'催促が、脱落を生んでいます',why:'登録12時間で5通届く設計は、相手から見れば「追われている」状態です。温度が見えないまま全員に同じ熱量で当たると、お客さまは離れ、営業は疲弊します。',step:'催促の自動配信を1通止める。止めても落ちません',proof:'<b>F社</b>（子育て世代向けサービス）：配信20通超→10通前後に半減で、キャンセル率 <b>46.2% → 31.3%</b>（−14.9pt）、ヒアリング回答率 63.4% → 74.2%。'},
    shinri:{t:'圧が、反転を起こしています',why:'強い言葉・赤文字・「！」の連続・カウントダウン。人は「動かされている」と感じた瞬間に止まります（心理的リアクタンス）。要求の中身は同じでも、届け方で結果が逆になります。',step:'催促文を1通、「理由→ハードル下げ→優しいトーン」に書き換える',proof:'ヒアリングシートの案内を書き換えただけで、回答率 <b>+10.8pt</b>。面談相手の73%は分析・支持タイプで、熱量で押すほど逃げます。'},
    mendan:{t:'「来たい気持ち」が、面談まで持っていません',why:'7日以上先の予約は半分来ません。枠の見せ方と、予約直後のひと言で実施率は動きます。面談で売るのではなく、面談前に「痛みの体験」と自分の言葉の「やりたい」を育てると、面談は確認の場になります。',step:'予約枠を1週間以内に絞る。予約直後5分以内に一言、日程変更の導線を置く（警告はゼロ）',proof:'<b>A社</b>（女性向け金融教育スクール）：予約枠を1週間以内に絞り、実施率 <b>48.8% → 59.1%</b>（+10.3pt）、7日超の予約 71件→0件。LINEのやり取り643件の分析では、煽りではなく「リスクを減らす言葉」が成約に最も寄与（58%）。'},
    horiokoshi:{t:'関心を寄せてくれた方に、もう一度お声がけを',why:'失注・キャンセルした方は、一度は興味を示した方です。追加の広告費はゼロ。責めると逃げ、気遣うと返ってきます。自動配信の定型文ではなく、個別の気遣いの1通から。',step:'直近3ヶ月の失注・キャンセルに「気遣いの1通」。日程は出さない',proof:'<b>F社</b>：自動配信の復活率 1.3〜2.2%（411件）→ 共感型の個別お声がけ <b>15.5%</b>（71件）。約10倍。共感型への返信は3件中3件（母数小）。'},
    none:{t:'土台は整っています。次は、率を1ptずつ上げる段階です',why:'数字が置けていて、催促も圧も少なく、掘り起こしも個別にできている。ここまで揃っている会社は多くありません。次の伸びしろは、1通ずつのA/Bと、面談前の温度設計です。',step:'配信文を1通ずつA/Bで検証し、面談創出率25%・面談成約率60%のレンジを目指す',proof:'弊社の面談成約率（決着ベース）<b>59.9%</b>（面談1,163件・2025年1月〜2026年9月）。安定の4本柱＝面談前の温度ゲート・リードタイム管理・当日キャンセル抑制・クローザーの適性。'}
  };

  function sigOf(k){
    var s='b', why='';
    if(k==='sekkei'){
      var unk=['leads','meet','close'].filter(function(x){return A[x]==='unknown';}).length;
      if(unk>=2){s='p';why='3つの矢印のうち'+unk+'つに数字がありません。まだ見えていない場所がある状態です。';}
      else if(unk===1){s='y';why='矢印の1つに数字がありません。そこが「誰の仕事でもない」場所になっている可能性があります。';}
      else {s='b';why='登録→面談→成約の数字が置けています。ここから率を動かせます。';}
    }
    if(k==='haishin'){
      var m=A.msgs, t=A.temp;
      if(m==='5'){s='p';why='登録から24時間で5通以上。相手から見ると「追われている」と感じられやすい配信量です。';}
      else if(m==='4'){s='y';why='24時間で3〜4通。重複や15分後の催促が混ざっていないか、1通ずつ見直す余地があります。';}
      else if(m==='unknown'){s='y';why='自動配信の通数は、まだ見えていない状態です。登録直後に何が届くかを、一度ご自身で受け取ってみるのがおすすめです。';}
      else {s='b';why='配信量は適正です。';}
      if(t==='same'){ if(s==='b') s='y'; why+=' 全員に同じ配信のため、温度が見えず、営業の時間が分散しやすくなります。'; }
      if(t==='none'){ if(s==='b') s='y'; why+=' 登録後の配信がないと、面談までのあいだに温度が下がります。1通1アクションの小さな導線から。'; }
    }
    if(k==='shinri'){
      if(A.pressure==='yes'){s='p';why='警告語を使っています。要求の中身は同じでも、届け方で結果が逆転します。';}
      else if(A.pressure==='unknown'){s='y';why='配信文の中身は、まだ見えていない状態です。下の圧チェッカーに1通貼ると、すぐ確認できます。';}
      else {s='b';why='警告語は使っていません。次は「理由・所要時間・優しいトーン」の3点が揃っているかです。';}
    }
    if(k==='mendan'){
      var lt=A.lt; var rate=null;
      if(typeof A.meet==='number'&&typeof A.close==='number'&&A.meet>0){ rate=A.close/A.meet; }
      if(lt==='8'){s='p';why='予約から面談まで8日以上。弊社支援先では、7日以上先の予約は半分来ませんでした。';}
      else if(lt==='7'){s='y';why='予約から面談まで4〜7日。1週間以内に収まっていますが、枠をもう少し手前に寄せる余地があります。';}
      else if(lt==='unknown'){s='y';why='予約から面談までの日数は、実施率を最も動かす数字の1つです。まずここを測るところからです。';}
      else {s='b';why='予約から面談までが短く、温度が保たれやすい状態です。';}
      if(rate!==null){
        var pct=Math.round(rate*100);
        if(rate<0.3){ s='p'; why+=' 面談成約率は約'+pct+'%。面談前に「欲しい」が育っていない可能性があります。'; }
        else if(rate<0.5){ if(s==='b') s='y'; why+=' 面談成約率は約'+pct+'%。50%の壁は、面談前の温度設計で越えられます。'; }
        else { why+=' 面談成約率は約'+pct+'%で、弊社レンジに近い水準です。'; }
      }
    }
    if(k==='horiokoshi'){
      if(A.lost==='none'){s='p';why='失注・キャンセルへの対応は、これからです。過去に関心を寄せてくれた方へのお声がけから始められます。';}
      else if(A.lost==='auto'){s='y';why='自動配信で案内しています。弊社支援先では自動配信1.3%に対し、個別の気遣いで15.5%でした。';}
      else {s='b';why='個別に声をかけています。次は「2通で止める・3択で聞く・日程は1〜2枠」の型に。';}
    }
    return {s:s,why:why};
  }

  function finish(){
    var sig={}; var order=['sekkei','haishin','shinri','mendan','horiokoshi'];
    order.forEach(function(k){sig[k]=sigOf(k);});
    var top=null;
    order.forEach(function(k){ if(!top && sig[k].s==='p') top=k; });
    if(!top) order.forEach(function(k){ if(!top && sig[k].s==='y') top=k; });
    var topKey=top||'none';

    // your 100
    var now=null, r1=null, r2=null;
    if(typeof A.leads==='number'&&typeof A.meet==='number'&&A.leads>0){ r1=A.meet/A.leads; }
    if(typeof A.meet==='number'&&typeof A.close==='number'&&A.meet>0){ r2=A.close/A.meet; }
    if(typeof A.leads==='number'&&A.leads>0&&typeof A.close==='number'){ now=Math.round(100*A.close/A.leads*10)/10; }
    var ours=15;
    var barMax=Math.max(15,now||0); $('bar_ours').style.width=(15/barMax*100)+'%';
    if(now!==null){
      var w=Math.max(0,Math.min(100,now/barMax*100));
      $('v_now').innerHTML=(Number.isInteger(now)?now:now.toFixed(1))+'<small>件</small>';
      setTimeout(function(){$('bar_now').style.width=w+'%';},80);
      var diff=Math.max(0,Math.round((ours-now)*10)/10);
      var mid=PRICE_MID[A.price]||0;
      var yen=Math.round(Math.round(diff*10)*mid/100000);
      if(diff>0){
        $('gaptext').innerHTML='同じ100名で、あと <b>'+(Number.isInteger(diff)?diff:diff.toFixed(1))+'件</b>。'+(mid?' 単価'+(mid/10000)+'万円と仮定した場合、100名あたり約 <b>'+yen.toLocaleString()+'万円</b>の差（試算）。':'')+' 面談創出率 '+(r1===null?'算出不可':Math.round(r1*100)+'%')+'、面談成約率 '+(r2===null?'算出不可':Math.round(r2*100)+'%')+' が、いまの御社の数字です。';
      } else {
        $('gaptext').innerHTML='弊社の構築レンジに届いています。ここから先は、1通ずつの検証で率を積み上げる段階です。';
      }
    } else {
      $('v_now').innerHTML='—<small>算出不可</small>';
      $('bar_now').style.width='0%';
      $('gaptext').innerHTML=A.leads===0?'見込み客数が0名のため、100名あたりの件数は算出できません。人数が集まった時点で、もう一度お試しください。':'100名あたりの件数を算出するには、見込み客数と成約件数が必要です。まずは、把握していない数字を確認するところから始めましょう。';
    }

    // signals
    var html='';
    order.forEach(function(k){
      var st=STAGES.filter(function(x){return x.k===k;})[0];
      html+='<div class="sig'+(k===top?' top':'')+'"><div class="dot '+sig[k].s+'"></div><div class="nm">'+st.nm+'<small>'+st.en+'</small><span class="signal-label">'+(sig[k].s==='b'?'流れている':sig[k].s==='y'?'見直す余地':'見直しの優先候補')+'</span></div><div class="tx">'+sig[k].why+'</div></div>';
    });
    $('signals').innerHTML=html;

    // culprit
    var c=CUL[topKey];
    var stname=top?STAGES.filter(function(x){return x.k===top;})[0].nm:'';
    $('culprit').innerHTML='<div class="cat">'+(top?'Main bottleneck — '+stname:'All clear')+'</div><h3>'+c.t+'</h3><p>'+c.why+'</p>'+
      '<div class="blk"><div class="k">今日できる1手</div><div class="v">'+c.step+'</div></div>'+
      '<div class="blk"><div class="k">弊社支援先の実測</div><div class="m">'+c.proof+'</div></div>';

    DIAG={top:top?stname:'整っている',topKey:topKey,signals:{sekkei:J(sig.sekkei.s),haishin:J(sig.haishin.s),shinri:J(sig.shinri.s),mendan:J(sig.mendan.s),horiokoshi:J(sig.horiokoshi.s)},now:now,ours:ours,r1:r1,r2:r2,inputs:JSON.parse(JSON.stringify(A))};
    $('quiz').style.display='none';
    $('result').classList.add('on'); $('quiz-privacy').hidden=true; focusSection($('result'));
  }
  function J(s){return s==='b'?'青':s==='y'?'黄':'桃';}

  /* ---------- checker ---------- */
  var NG=['まだ','無断','ラスト','先着','至急','絶対','今すぐ','急いで','急ぎ','期限','警告','注意','必ず','締切','締め切り','残りわずか','お早めに','最後','見逃','逃さ'];
  var ACT=/(ください|下さい|お願いします|お願いいたします|してね|送ってね|お送り|ご回答|ご記入|ご登録|ご予約|お申し込み|お申込み|ご視聴|ご確認|お申し出|ご返信|ご参加|ご提出|お選び)/g;
  var TIME=/(\d+|[一二三四五六七八九十]+)\s*(秒|分|分間|分ほど|分程度|分で)/;
  var WHY=/(ので|ため|から|理由|だから|のです)/;

  function updateCount(){ $('char-count').textContent=Array.from($('msg').value).length.toLocaleString()+'文字'; }
  $('msg').addEventListener('input',function(){updateCount();$('message-error').textContent='';$('msg').removeAttribute('aria-invalid');$('chk').classList.remove('on');});
  $('sample').addEventListener('click',function(){
    $('msg').value='【重要】ヒアリングシートが完了していません！\n期限が迫っています。至急ご対応ください！！\nあわせてフルネームの送付と、インタビュー動画の視聴、感想の送付もお願いします。';
    updateCount();$('message-error').textContent='';$('msg').removeAttribute('aria-invalid');$('chk').classList.remove('on');$('msg').focus();
  });
  $('check').addEventListener('click',function(){
    var t=$('msg').value||'';
    if(!t.trim()){ $('message-error').textContent='チェックしたい文章を入力するか、例文をお試しください。';$('msg').setAttribute('aria-invalid','true');$('msg').focus();return; }
    $('message-error').textContent=''; $('msg').removeAttribute('aria-invalid');
    var items=[]; var ok=0;
    // 1 actions
    var acts=(t.match(ACT)||[]).length;
    if(acts>=2){ items.push(['ng','お願いが'+acts+'か所あります','1通1アクションに分けると、次にすることが伝わります。複数のお願いは、読み手の負担になることがあります。']); }
    else { ok++; items.push(['ok','お願いは1つに絞れています',acts===0?'お願いの文が見当たりません。贈り物だけの1通なら、それも立派な設計です。':'1通1アクション。所要時間を添えると、さらに動きます。']); }
    // 2 NG words
    var hit=NG.filter(function(w){return t.indexOf(w)>=0;});
    if(hit.length){ items.push(['ng','強い言い方の候補が'+hit.length+'種類あります','「まだ」→「ご案内の続きです」、「無断キャンセルはご遠慮ください」→「ご都合が変わったら、こちらから変更できます」のように、逃げ道を先に手渡す言い方に。']); }
    else { ok++; items.push(['ok','警告語はありません','圧センサーの第1関門は通過です。']); }
    // 3 emphasis
    var ex=(t.match(/[!！‼❗]/g)||[]).length; var dbl=/[!！]{2,}|‼/.test(t); var strong=/【重要】|【緊急】|重要|緊急/.test(t);
    if(dbl||ex>=3||strong){ items.push(['ng','強調が多めです（「！」'+ex+'個'+(strong?'・【重要】':'')+'）','「！」は1通に1つまで。赤文字・太字・「重要」は、受け取る側には「怒られている」に近い温度で届きます。']); }
    else { ok++; items.push(['ok','強調は控えめです','感情のピークは1点に。最後の一言で印象を「楽しみ」に上書きすると、読後感まで設計できます。']); }
    // 4 time
    if(TIME.test(t)){ ok++; items.push(['ok','所要時間が書いてあります','所要時間の目安があると、取りかかる場面をイメージしやすくなります。']); }
    else { items.push(['ng','所要時間がありません','読み手が迷いやすいのは「いつ終わるか分からないこと」。「約1分で終わります」を添えてください。']); }
    // 5 why
    if(WHY.test(t)){ ok++; items.push(['ok','「なぜ」が入っています','理由を添えると、お願いの目的を理解してもらいやすくなります。']); }
    else { items.push(['ng','「なぜ」がありません','「〇〇がないと、正しくご案内できません…」のように、お願いの前に理由を1行。']); }
    // 6 length
    var len=Array.from(t.replace(/\s/g,'')).length;
    if(len<=300){ ok++; items.push(['ok','文字数 '+len+'字（300字以内）','開いた瞬間に「何を・何分で・なぜ」が分かる長さです。']); }
    else { items.push(['ng','文字数 '+len+'字（300字超）','スクロールが要る長さは、読まれにくくなります。1通に1つだけ残して、残りは次の配信に。']); }
    // 7 emoji dup
    var emo=t.match(/\p{Extended_Pictographic}/gu)||[]; var cnt={}; var dup=[];
    emo.forEach(function(e){cnt[e]=(cnt[e]||0)+1;}); Object.keys(cnt).forEach(function(e){ if(cnt[e]>=2) dup.push(e+'×'+cnt[e]); });
    if(dup.length){ items.push(['ng','同じ絵文字が重なっています：'+dup.join(' '),'同じ絵文字の連続は、雑な印象になりやすいです。1通1〜3個、強調したい1点にだけ。']); }
    else if(emo.length>3){ items.push(['info','絵文字が'+emo.length+'個あります','多すぎると「絵文字疲れ」になります。1通1〜3個が目安です。']); }
    else { ok++; items.push(['ok','絵文字は厳選されています',emo.length===0?'絵文字ゼロでも、文章力で温度は出せます。':'感情のピーク1点に置けています。']); }

    // 8 date/weekday. If the year is omitted, identify the assumed year explicitly.
    var dm=t.match(/(?:(\d{4})年)?(\d{1,2})月(\d{1,2})日\s*[（(]?([月火水木金土日])?/);
    if(dm){
      var year=dm[1]?Number(dm[1]):new Date().getFullYear();
      var month=Number(dm[2]),day=Number(dm[3]);
      var date=new Date(year,month-1,day);
      var assumption=dm[1]?'': '年の記載がないため、'+year+'年として確認しています。';
      if(date.getFullYear()!==year||date.getMonth()!==month-1||date.getDate()!==day){
        items.push(['ng','日付をご確認ください：'+month+'月'+day+'日',year+'年のカレンダーにない日付です。'+assumption]);
      } else {
        var weekday='日月火水木金土'[date.getDay()];
        if(dm[4]&&dm[4]!==weekday) items.push(['ng','曜日をご確認ください：'+month+'月'+day+'日は「'+weekday+'」曜日です',year+'年として確認した結果、本文の曜日と異なっています。'+assumption]);
        else if(dm[4]){ok++;items.push(['ok','日付と曜日が合っています（'+month+'月'+day+'日・'+weekday+'曜日）',assumption||year+'年のカレンダーで確認しました。']);}
        else items.push(['info',month+'月'+day+'日は '+weekday+'曜日です',assumption+'曜日も添えると予定を入れやすくなります。']);
      }
    } else {ok++;items.push(['ok','日付の記載はありません','日付を入れるときは、年・月・日と曜日を確認しましょう。']);}

    var html='<div class="score"><span class="n">'+ok+' / 8</span><span class="l">圧の少なさ（機械チェックの目安です）</span></div>';
    items.forEach(function(it){ html+='<div class="ck '+it[0]+'"><div class="ic">'+(it[0]==='ok'?'✓':it[0]==='ng'?'!':'i')+'</div><div><div class="t">'+it[1]+'</div><div class="d">'+it[2]+'</div></div></div>'; });
    html+='<p class="note" style="margin-top:6px">最後の関門は、声に出して読むこと。書いた本人が違和感を覚える文章は、お客さまも違和感を覚えます。</p>';
    $('chk').innerHTML=html; $('chk').classList.add('on'); focusSection($('chk'));
  });


  /* ---------- copy buttons ---------- */
  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click',async function(){
      var el=$(b.dataset.copy);if(!el) return;
      var copied=false;
      try{await navigator.clipboard.writeText(el.textContent);copied=true;}catch(e){
        var ta=document.createElement('textarea');ta.value=el.textContent;ta.style.position='fixed';ta.style.opacity='0';
        document.body.appendChild(ta);ta.select();
        try{copied=document.execCommand('copy');}catch(ignore){}
        ta.remove();b.focus({preventScroll:true});
      }
      $('copy-status').textContent=copied?'文面をコピーしました。':'コピーできませんでした。文面を選択してコピーしてください。';
      b.textContent=copied?'コピーしました':'コピーできませんでした';
      setTimeout(function(){b.textContent='コピー';},2000);
    });
  });


  /* ---------- lead form ---------- */
  var submitting=false,pendingRow=null,pendingSignature='';
  $('leadform').addEventListener('input',function(e){if(e.target.matches('input,textarea')) e.target.removeAttribute('aria-invalid');});
  $('leadform').addEventListener('submit',function(e){
    e.preventDefault();if(submitting)return;
    var name=$('f_name').value.trim(),mail=$('f_mail').value.trim(),company=$('f_company').value.trim();
    var st=$('formst');
    function invalid(id,text){st.className='st ng';st.textContent=text;$(id).setAttribute('aria-invalid','true');$(id).focus();}
    if(!name){invalid('f_name','お名前をご記入ください。');return;}
    if(!mail||!$('f_mail').validity.valid||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)){invalid('f_mail','メールアドレスの形式をご確認ください。');return;}
    if(DEMO){st.className='st';st.textContent='入力内容を確認できました。プレビューのため送信していません。';return;}
    var row={
      run_id:'nurture-gift',task_key:'l_'+Date.now()+'_'+Math.floor(Math.random()*1000000),done:true,
      owner_depts:'nurture-gift',owner_members:name.slice(0,40),
      memo:JSON.stringify({v:1,name:name,company:company,mail:mail,line:$('f_line').value.trim(),mendan:true,src:SRC,price:(A.price||''),diag:DIAG,note:$('f_note').value.trim(),at:new Date().toISOString(),ua:navigator.userAgent.slice(0,120)}),
      link_url:'',updated_at:new Date().toISOString()
    };
    var signature=JSON.stringify([name,mail,company,$('f_line').value,$('f_note').value,DIAG]);
    if(pendingRow&&signature===pendingSignature){row=pendingRow;}else{pendingRow=row;pendingSignature=signature;}
    submitting=true;$('send').disabled=true;$('send').textContent='送信しています…';
    $('leadform').setAttribute('aria-busy','true');st.className='st';st.textContent='送信しています。画面を閉じずにお待ちください。';
    var controller=new AbortController(),timeout=setTimeout(function(){controller.abort();},20000);
    fetch(SB_URL+'/rest/v1/promo_tasks',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates'},body:JSON.stringify(row),signal:controller.signal})
      .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);
        pendingRow=null;$('formcard').classList.add('hidden');$('thanks').classList.add('on');focusSection($('thanks'));
      })
      .catch(function(){st.className='st ng';st.textContent='送信完了を確認できませんでした。入力内容は残っています。通信状況をご確認のうえ、もう一度お試しください。';})
      .finally(function(){clearTimeout(timeout);submitting=false;$('send').disabled=false;$('send').innerHTML='無料コンサルに申し込む <span aria-hidden="true">→</span>';$('leadform').removeAttribute('aria-busy');});
  });

  // A single navigation row stays usable on small screens, without a menu layer.
  if('IntersectionObserver' in window){
    var observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){if(entry.isIntersecting){document.querySelectorAll('.site-nav a').forEach(function(a){if(a.hash==='#'+entry.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}});
    },{rootMargin:'-15% 0px -55% 0px'});
    ['diag','checker','gift3'].forEach(function(id){observer.observe($(id));});
  }
})();
