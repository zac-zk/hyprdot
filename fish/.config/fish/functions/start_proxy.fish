function start_proxy
    set -x https_proxy=http://127.0.0.1:20172
    set -x http_proxy=http://127.0.0.1:20172
    set -x all_proxy=http://127.0.0.1:20172
end
