const SUPABASE_URL = "https://TON_URL.supabase.co";
const SUPABASE_KEY = "TON_PUBLIC_KEY";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// LOGIN
function showLogin(){
  content.innerHTML=`
    <h2>Connexion</h2>
    <input id="email" placeholder="Email"><br>
    <input id="password" type="password" placeholder="Mot de passe"><br>
    <button onclick="login()">Login</button>
  `;
}

async function login(){
  const { error } = await supabase.auth.signInWithPassword({
    email:email.value,
    password:password.value
  });

  if(error) alert(error.message);
  else alert("Connecté ✅");
}

// JOBS
async function loadJobs(){
  const {data}=await supabase.from("jobs").select("*");

  content.innerHTML="<h2>Jobs</h2>"+
  data.map(j=>`<div class="card"><b>${j.title}</b></div>`).join("");
}

// JOBS EXTERNES
async function loadExternal(){
  const {data}=await supabase
    .from("external_jobs")
    .select("*")
    .eq("status","approved");

  content.innerHTML="<h2>Jobs externes</h2>"+
  data.map(j=>`
    <div class="card">
      ${j.title}<br>
      ${j.company}
      ${j.is_urgent ? " ⚡ URGENT" : ""}
    </div>
  `).join("");
}

// GEO
function getUserLocation(){
  return new Promise((res,rej)=>{
    navigator.geolocation.getCurrentPosition(p=>res(p.coords),rej);
  });
}

function getDistance(a,b,c,d){
  const R=6371;
  const dLat=(c-a)*Math.PI/180;
  const dLon=(d-b)*Math.PI/180;
  const x=Math.sin(dLat/2)**2+
    Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*
    Math.sin(dLon/2)**2;
  return R*(2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)));
}

// URGENTS PROCHES
async function getNearbyUrgentJobs(){
  const user=await getUserLocation();

  const {data}=await supabase
    .from("external_jobs")
    .select("*")
    .eq("is_urgent",true)
    .eq("status","approved");

  const jobs=data.map(j=>({
    ...j,
    distance:getDistance(user.latitude,user.longitude,j.lat,j.lng)
  }));

  jobs.sort((a,b)=>a.distance-b.distance);

  content.innerHTML="<h2>⚡ Jobs urgents proches</h2>"+
  jobs.map(j=>`
    <div class="card">
      ${j.title}<br>
      📍 ${j.distance.toFixed(1)} km
    </div>
  `).join("");
}

// PROFILS
async function loadProfiles(){
  const {data}=await supabase.from("profiles").select("*");

  content.innerHTML="<h2>Candidats</h2>"+
  data.map(u=>`<div class="card">${u.name||"Sans nom"}</div>`).join("");
}

// CHAT
function showChat(){
  content.innerHTML=`
    <h2>Chat</h2>
    <input id="receiver" placeholder="ID utilisateur"><br>
    <input id="msg" placeholder="Message"><br>
    <button onclick="sendMessage()">Envoyer</button>
  `;
}

async function sendMessage(){
  const user=await supabase.auth.getUser();

  await supabase.from("messages").insert([{
    sender_id:user.data.user.id,
    receiver_id:receiver.value,
    content:msg.value
  }]);

  alert("Message envoyé 📩");
}
