
PUB := firebase/public

serve:
	venv/bin/python react_env.py development && \
	cd firebase && firebase serve

admin:
	venv/bin/python fb_admin.py --set-admin

deploy:
	venv/bin/python react_env.py production && \
	rm -rf firebase/public/v2/js/ && \
	mkdir -p firebase/public/v2/js && \
	npx babel react/src --out-dir firebase/public/v2/js/   --presets react-app/prod && \
	cd firebase && firebase deploy

babel:
	rm -rf firebase/public/v2/js/ && \
	mkdir -p firebase/public/v2/js && \
	npx babel --watch react/src --out-dir firebase/public/v2/js/   --presets react-app/prod

clean:
	rm -f -r $(PUB)/v2/js

.PHONY: serve deploy babel clean admin
