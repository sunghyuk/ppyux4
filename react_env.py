import argparse
import glob
import fileinput
import sys

'''
<!-- Load React. -->
<!-- Note: when deploying, replace "development.js" with "production.min.js". -->
<script src="https://unpkg.com/react@16/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js" crossorigin></script>
'''
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('env', help='specify environment')

    args = parser.parse_args()

    if args.env not in["development", "production"]:
        print("Error env: {}".format(args.env))
        sys.exit(1)

    if args.env == "development":
        env_from = "production.min"
        env_to ="development"
    elif args.env == "production":
        env_from = "development"
        env_to = "production.min"
    print("{} => {}".format(env_from, env_to))

    htmls = glob.glob("firebase/public/v2/*.html")
    for html in htmls:
        print("change: {}".format(html))
        for line in fileinput.input(html, inplace=True):
            if "<script" in line and env_from in line:
                print(line.replace(env_from, env_to), end='')
            else:
                print(line, end='')