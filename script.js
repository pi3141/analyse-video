/********************************************************************

  Éléments de l'interface graphiques

********************************************************************/
// vidéo
const video = document.getElementById("video");
const source_video = document.getElementById("source_video");
const mon_canvas = {
  canvas: document.getElementById("canvas"),
  ctx: this.canvas.getContext("2d"),
  initialise: false,
};
// controles de la vidéo
const charger_video = document.getElementById("charger_video");
const img_precedente = document.getElementById("reculer");
const img_suivante = document.getElementById("avancer");
const choix_dt = document.getElementById("dt");
const label_date = document.getElementById("date");
// controles de l'échelle
const bouton_etalonnage = document.getElementById("etalonnage");
const valeur_etalon = document.getElementById("longueur_etalon");
const unite_etalon = document.getElementById("unites");
// controle origine repère
const bouton_origine = document.getElementById("origine");
// pointage
const bouton_pointage = document.getElementById("pointage");
const bouton_effacer = document.getElementById("effacer");
const bouton_effacer_tout = document.getElementById("effacer_tout");
// exportation
const bouton_exporter_csv = document.getElementById("exporter_csv");
const bouton_exporter_py = document.getElementById("exporter_py");

/********************************************************************

  Etape du pointage : mise à jour de l'interface graphique

********************************************************************/
let etat_GUI = {
  mode_initial: function () {
    this.disable_nav_video(true);
    choix_dt.disabled = true;
    this.disable_etalonnage(true);
    this.disable_origine(true);
    this.disable_pointage(true);
    this.disable_export(true);
    bouton_etalonnage.style.backgroundColor = "";
    bouton_pointage.style.backgroundColor = "";    
    bouton_origine.style.backgroundColor = "";        
    mon_canvas.canvas.removeEventListener("click", pointage_trajectoire);
    mon_canvas.canvas.removeEventListener("click", choix_origine);
  },

  mode_video_chargee: function () {
    this.disable_nav_video(false);
    choix_dt.disabled = false;
    this.disable_etalonnage(false);
    this.disable_origine(false);
    this.disable_pointage(true);
    this.disable_export(true);
    bouton_pointage.disabled = false;
    bouton_etalonnage.style.backgroundColor = "";
    bouton_pointage.style.backgroundColor = "";    
    bouton_origine.style.backgroundColor = "";    
  },

  mode_etalonnage: function () {
    this.disable_nav_video(false);
    choix_dt.disabled = false;
    this.disable_etalonnage(false);
    this.disable_origine(true);
    this.disable_pointage(true);
    this.disable_export(true);
  },

  mode_pointage: function () {
    this.disable_nav_video(false);
    choix_dt.disabled = true;
    this.disable_etalonnage(true);
    this.disable_origine(true);
    this.disable_pointage(false);
    this.disable_export(false);
  },

  mode_origine: function () {
    this.disable_nav_video(false);
    choix_dt.disabled = false;
    this.disable_etalonnage(true);
    this.disable_origine(false);
    this.disable_pointage(true);
    this.disable_export(true);
  },

  disable_nav_video: function (b) {
    img_precedente.disabled = b;
    img_suivante.disabled = b;
  },

  disable_export: function (b) {
    bouton_exporter_csv.disabled = b;
    bouton_exporter_py.disabled = b;
  },

  disable_pointage: function (b) {
    bouton_pointage.disabled = b;
    bouton_effacer.disabled = b;
    bouton_effacer_tout.disabled = b;
  },

  disable_etalonnage: function (b) {
    bouton_etalonnage.disabled = b;
    valeur_etalon.disabled = b;
    unite_etalon.disabled = b;
  },

  disable_origine: function (b) {
    bouton_origine.disabled = b;
  },
};

/********************************************************************

  Paramètres du modèle

********************************************************************/



let modele = {  

  init : function(){
    this.dt = parseFloat(choix_dt.value);
    this.echelle =  1.0;
    this.point_O = { X: -50, Y: -50 };
    this.t_0 = 0.0 ;
    this.trajectoire_pix = [];
    this.trajectoire_m =  [];
    this.point_A = { x: 0, y: 0 };
    this.point_B = { x: 0, y: 0 };
    this.point_M = { x: 0, y: 0 };  
    this.updateViews();
    etat_GUI.mode_initial();
  },

  setOrigine: function (T_0, X_0, Y_0) {
    this.point_O.X = X_0;
    this.point_O.Y = Y_0;
    this.t_0 = T_0;
    this.updateViews();
  },

  set_dt : function ( dt ){
    this.dt = dt;
    this.updateViews();
  },

  getOrigine: function () {
    return [this.point_O.X, this.point_O.Y];    
  },

  setEchelle: function () {
    let longueur_etalon_pix = Math.sqrt(
      (this.point_A.x - this.point_B.x) ** 2 + (this.point_A.y - this.point_B.y) ** 2
    );
    let longueur_etalon_m = valeur_etalon.value * 10 ** unite_etalon.value;
    this.echelle = longueur_etalon_m / longueur_etalon_pix;
    this.updateViews();
  },

  setPointXY: function (T, X, Y) {
    this.trajectoire_pix.push([T, X, Y]);
    this.updateViews();
  },
  
  setPointA: function (X, Y) {
    this.point_A.x = X;
    this.point_A.y = Y;
    this.point_B.x = X;
    this.point_B.y = Y;
    this.point_M.x = X;
    this.point_M.y = Y;
    this.updateViews();
  },

  setPointB: function (X, Y) {
    this.point_B.x = X;
    this.point_B.y = Y;
    this.setEchelle();
  },
  
  setPointM: function (X, Y) {
    this.point_M.x = X;
    this.point_M.y = Y;
    this.updateViews();
  },

  calculer_trajectoire_en_metre: function () {
    this.trajectoire_m = [];
    let data = this.trajectoire_pix;
    for (let d in data) {
      let t = data[d][0] - this.t_0;
      let x = (data[d][1] - this.point_O.X) * this.echelle;
      let y = (this.point_O.Y - data[d][2]) * this.echelle;
      this.trajectoire_m.push([t, x, y]);
    }

    this.trajectoire_m.sort(function (a, b) {
      let t = 0;
      if (a[0] > b[0]) {
        t = 1;
      } else if (a[0] < b[0]) {
        t = -1;
      } else {
        t = 0;
      }
      return t;
    });
  },

  effacerTrajectoire: function () {
    this.trajectoire_pix = [];
    this.trajectoire_m = [];
    this.updateViews();
  },

  effacerPoint: function (T) {
    let data = this.trajectoire_pix;
    for (let d in data) {
      let t = data[d][0];      
      if (t == T) {        
        this.trajectoire_pix.splice(d , 1);        
        break;
      }
    }
    this.updateViews();
  },

  exporter_csv: function () {
    this.calculer_trajectoire_en_metre();
    let tableau = "t(s);x(m);y(m)\n";
    for (let i in this.trajectoire_m) {
      let T = this.trajectoire_m[i][0].toFixed(3).replace('.',',');;
      let X = this.trajectoire_m[i][1].toFixed(3).replace('.',',');;
      let Y = this.trajectoire_m[i][2].toFixed(3).replace('.',',');;
      tableau = tableau + T + ";" + X + ";" + Y + "\n";
    }
    return tableau;
  },

  exporter_py: function () {
    this.calculer_trajectoire_en_metre();
    let tableau_t = "t = [";
    let tableau_x = "x = [";
    let tableau_y = "y = [";
    let ligne_t   = "    ";
    let ligne_x   = "    ";
    let ligne_y   = "    ";    
    for (let i in this.trajectoire_m) {
      let T = this.trajectoire_m[i][0].toFixed(3);
      let X = this.trajectoire_m[i][1].toFixed(3);
      let Y = this.trajectoire_m[i][2].toFixed(3);      
      ligne_t = ligne_t + T + ", ";
      if( ligne_t.length > 40 ){
        tableau_t  = tableau_t + "\n" + ligne_t;
        ligne_t   = "    ";
      };      
      ligne_x = ligne_x + X + ", ";
      if( ligne_x.length > 40 ){
        tableau_x  = tableau_x + "\n" + ligne_x;
        ligne_x   = "    ";
      };      
      ligne_y = ligne_y + Y + ", ";
      if( ligne_y.length > 40 ){
        tableau_y  = tableau_y + "\n" + ligne_y;
        ligne_y   = "    ";
      };      
    }    
    tableau_t = tableau_t + "\n" + ligne_t + "\n    ]";
    tableau_x = tableau_x + "\n" + ligne_x + "\n    ]";
    tableau_y = tableau_y + "\n" + ligne_y + "\n    ]";   
    
    let code = tableau_t + "\n\n" + tableau_x + "\n\n" + tableau_y + "\n\n";
    code =  code + "import matplotlib.pyplot as plt\nplt.plot(x , y, 'r+' )\n";
    code =  code + "plt.axis('equal')\n";
    code =  code + "plt.xlabel('x (m)')\nplt.ylabel('y (m)')\nplt.show()\n";
    return code;
  },

  video_reculer : function(){
    if (video.currentTime - modele.dt > -modele.dt) {
      video.currentTime = video.currentTime - modele.dt;
      this.updateViews();
    }
  },

  video_avancer : function () {
    if (video.currentTime + modele.dt < video.duration) {
      video.currentTime = video.currentTime + modele.dt;
      this.updateViews();
    }
  },

  updateViews : function (){
    dessiner_echelle_repere_trajectoire();    
    label_date.innerText = ( Math.round( video.currentTime * 1000) / 1000 ).toFixed(3) + " s";
  },
};

/********************************************************************

  Valeurs initiales de l'application

********************************************************************/
modele.init();

/********************************************************************

  Controles de la vidéo

********************************************************************/
// Chargement de la vidéo
charger_video.onchange = () => {
  modele.init();
  mon_canvas.initialise = false;
  source_video.src = window.URL.createObjectURL(charger_video.files[0]);
  video.load();
  // création du canvas quand la viéo est totalement chargée lors
  // du premier appel seulement
  video.addEventListener(
    "canplay",
    function () {
      if (mon_canvas.initialise == false) {
        // lors du premier chargement
        // le canvas et son contexte doivent avori les mêmes dimensions
        // et la même position que la vidéo
        mon_canvas.canvas.width = video.offsetWidth;
        mon_canvas.canvas.height = video.offsetHeight;
        mon_canvas.canvas.offsetLeft = "-" + video.offsetLeft + "px";
        mon_canvas.canvas.offsetTop = "-" + video.offsetTop + "px";
        mon_canvas.canvas.style.width = mon_canvas.canvas.width + "px";
        mon_canvas.canvas.style.height = mon_canvas.canvas.height + "px";
        // le canvas est au dessus de la vidéo
        mon_canvas.canvas.style.zIndex = 10;
        mon_canvas.initialise = true;
      }
    },
    false
  );  
  etat_GUI.mode_video_chargee(); // on change l'état de l'affichage des controles
};

// Navigation image par image: reculer
img_precedente.addEventListener("click", function () {
  modele.video_reculer();
});

// Navigation image par image: avancer
img_suivante.addEventListener("click", function () {
  modele.video_avancer();
});

/********************************************************************

  Choix de la fréquence des images 

********************************************************************/
choix_dt.addEventListener("change", function () {
  modele.set_dt( parseFloat(choix_dt.value) );
});

/********************************************************************

  Étalonnage des unités de longueurs px vs m

********************************************************************/
bouton_etalonnage.addEventListener("click", function () {
  if (bouton_etalonnage.style.backgroundColor == "") {
    mon_canvas.canvas.addEventListener("mousedown", choix_debut_echelle);
    mon_canvas.canvas.addEventListener("mouseup", choix_fin_echelle);
    mon_canvas.canvas.addEventListener("mousemove", choix_pendant_echelle);
    bouton_etalonnage.style.backgroundColor = "yellow";
    etat_GUI.mode_etalonnage();
  } else {
    mon_canvas.canvas.removeEventListener("mousedown", choix_debut_echelle);
    mon_canvas.canvas.removeEventListener("mouseup", choix_fin_echelle);
    mon_canvas.canvas.removeEventListener("mousemove", choix_pendant_echelle);
    bouton_etalonnage.style.backgroundColor = "";
    etat_GUI.mode_video_chargee();
  }
});

var TRACER = false;
function choix_debut_echelle(e) {  
  modele.setPointA(e.layerX , e.layerY);  
  TRACER = true;  
}
function choix_pendant_echelle(e) {
  if (TRACER == true) {
    modele.setPointM(e.layerX , e.layerY);      
  }
}
function choix_fin_echelle(e) {
  TRACER = false;
  modele.setPointB(e.layerX , e.layerY);         
}

/********************************************************************

  Choix de l'origine du repère (espace et temps)

********************************************************************/
bouton_origine.addEventListener("click", function () {
  if (bouton_origine.style.backgroundColor == "" ) {
    mon_canvas.canvas.addEventListener("click", choix_origine);
    bouton_origine.style.backgroundColor = "yellow";
    etat_GUI.mode_origine();
  } else {
    mon_canvas.canvas.removeEventListener("click", choix_origine);
    bouton_origine.style.backgroundColor = "";
    etat_GUI.mode_video_chargee();
  }
});

function choix_origine(e) {
  modele.setOrigine(video.currentTime, e.layerX, e.layerY);  
}
/********************************************************************

 Affichages des graphiques

********************************************************************/
function dessiner_echelle_repere_trajectoire() {
  let X_O = modele.getOrigine()[0];
  let Y_O = modele.getOrigine()[1];
  // dessin règle calibration
  mon_canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
  mon_canvas.ctx.lineWidth = 2;
  mon_canvas.ctx.strokeStyle = "#ffff00";
  mon_canvas.ctx.beginPath();
  mon_canvas.ctx.moveTo(modele.point_A.x, modele.point_A.y);
  mon_canvas.ctx.lineTo(modele.point_M.x, modele.point_M.y);
  mon_canvas.ctx.stroke();
  // dessin du repère
  mon_canvas.ctx.strokeStyle = "#ffffff";
  mon_canvas.ctx.lineWidth = 1;
  mon_canvas.ctx.beginPath();
  mon_canvas.ctx.moveTo(X_O, Y_O - 20);
  mon_canvas.ctx.lineTo(X_O, Y_O);
  mon_canvas.ctx.lineTo(X_O + 20, Y_O);
  mon_canvas.ctx.stroke();
  mon_canvas.ctx.font = "20px Arial";
  mon_canvas.ctx.fillStyle = "#ffffff";
  mon_canvas.ctx.fillText("x", X_O + 10, Y_O + 15);
  mon_canvas.ctx.fillText("y", X_O - 15, Y_O - 7);
  // dessin points trajectoire
  mon_canvas.ctx.strokeStyle = "#ff0000";
  mon_canvas.ctx.lineWidth = 1;
  let traj = modele.trajectoire_pix;
  for (let d in traj) {
    let x = traj[d][1];
    let y = traj[d][2];
    mon_canvas.ctx.beginPath();
    mon_canvas.ctx.moveTo(x - 4, y);
    mon_canvas.ctx.lineTo(x + 4, y);
    mon_canvas.ctx.stroke();
    mon_canvas.ctx.beginPath();
    mon_canvas.ctx.moveTo(x, y - 4);
    mon_canvas.ctx.lineTo(x, y + 4);
    mon_canvas.ctx.stroke();
  }
}

/********************************************************************

  Pointage de la trajectoire

********************************************************************/
bouton_pointage.addEventListener("click", function () {
  if ( bouton_pointage.style.backgroundColor == "" ) {
    mon_canvas.canvas.addEventListener("click", pointage_trajectoire);
    bouton_pointage.style.backgroundColor = "yellow";
    etat_GUI.mode_pointage();
  } else {
    mon_canvas.canvas.removeEventListener("click", pointage_trajectoire);
    bouton_pointage.style.backgroundColor = "";
    etat_GUI.mode_video_chargee();
  }
});

function pointage_trajectoire(e) {
  modele.setPointXY(video.currentTime, e.layerX, e.layerY);  
  modele.video_avancer();
}
/********************************************************************

  Effacer le point actuel

********************************************************************/
bouton_effacer.addEventListener("click", function () {
  let T = video.currentTime;
  modele.effacerPoint(T);  
});

/********************************************************************

  Effacer tous les points

********************************************************************/
bouton_effacer_tout.addEventListener("click", function () {
  modele.effacerTrajectoire();  
});

/********************************************************************

  Exporter CSV

********************************************************************/
bouton_exporter_csv.addEventListener("click", function () {
  navigator.clipboard.writeText(modele.exporter_csv());
});

/********************************************************************

  Exporter .PY

********************************************************************/
bouton_exporter_py.addEventListener("click", function () {
  navigator.clipboard.writeText(modele.exporter_py());
});
