function stop_proxy
    set -u https_proxy
    set -u http_proxy
    set -u all_proxy
end
