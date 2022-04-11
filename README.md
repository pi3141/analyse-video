# analyse-video
## Résumé
Application web de pointage de vidéo pour l'étude du mouvement. Après avoir chargé une vidéo d'un mouvement, on choisit la fréquence des images, on calibre l'échelle des longueurs grâce à un étalon, on choisit l'origine des temps et du repère, puis on pointe image par image la position d'un objet en mouvement. Il est ensuite possible d'exporter les coordonnées des positions (x(t), y(t)) sous format .csv ou sous forme d'un script Python traçant la trajectoire. L'exportation se fait via le presse papier.

## Chargement d'une vidéo
Seules les vidéos aux formats compatibles avec le HTML5 sont prises en charge: mp4, webm et ogg.

On règlera également la fréquence des images (de 10 i/s à 30 i/s).

## Étalonnage de l'échelle des longueurs
On active ce mode en cliquant sur le bouton étalonnage qui bascule en couleur jaune.

On pointe ensuite le début de l'étalon de longueur avec la souris et en maintenant enfoncé le bouton gauche, on traine la souris jusqu'à l'autre extérimé de l'étalon puis on lache le bouton. Un trait jaune matérialise l'étalon choisit. 

On renseigne également la valeur de la longueur de l'étalon ainsi qe l'unité utilisée.

On sort du mode étalonnage en cliquant sur le bouton étalonnage, il redevient gris.

## Choix de l'origine des temps et de l'espace
On se place au départ sur l'image correspondant à notre origine des temps à l'aide des boutons avancer/reculer.

On bascule ensuite  en mode choix de l'origine en cliquant sur le bouton Origine, qui passe en jaune.

On clique ensuite sur la vidéo pour positionner l'origine du repère. Elle est matérialisée par un petit système d'axe Oxy.

On quitte le mode Origine en cliquant sur le bouton origine qui redevient gris.

## Pointage du mouvement
On bascule dans le mode pointage en cliquant sur le bouton pointage qui devient jaune.

On clique ensuite sur la vidéo sur l'objet dont on suit le mouvement, une croix rouge matérialise la position sur la trajectoire.

On peut supprimer le point de l'image courante ou supprimer l'ensemble des points.

L'exportation permet de coller dans le presse papier un texte qui correspond
  - à une table au format .csv avec le temps , la position x et la position y
  - à un scrip Python qui stocke les valeurs du tempsn et des positions dans trois listes et qui affiche la trajectoire avec MathPlot

On appuit sur le bouton d'exportation, et une copie des valeurs est faite dans le presse papier. Il faut ensuite faire un coler du texte dans une application capable de gérer le csv ou le script Python.
