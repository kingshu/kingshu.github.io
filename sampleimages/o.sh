a=$(ls -l | ggrep -P "si_\d+\.jpg" | wc -l)
for i in *unsplash*.jpg; do
  new=$(printf "si_%d.jpg" "$a") #04 pad to length of 4
  mv -i -- "$i" "$new"
  let a=a+1
done
