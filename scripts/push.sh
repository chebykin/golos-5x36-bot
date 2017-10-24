read -p "Are you sure? " -n 1 -r
echo    # (optional) move to a new line
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
  [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1
fi

docker build -t golos-5x36-bot .
docker tag golos-5x36-bot:latest chebykin/golos-5x36-bot:latest
docker push chebykin/golos-5x36-bot:latest
