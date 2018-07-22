close all;
conn = sqlite('../server/results.sqlite', 'readonly');

unique_concurrency = fetch(conn, 'SELECT DISTINCT concurrency FROM runs');
unique_delay = fetch(conn, 'SELECT DISTINCT delay FROM runs');

X = cell2mat(unique_concurrency);
Y = cell2mat(unique_delay);
Z_mean = zeros(length(unique_concurrency), length(unique_delay));
Z_deviation = Z_mean;
max_mean = 0;
max_deviation = 0;

for version = 1:2
    query = strcat('SELECT * FROM runs WHERE http_version=', int2str(version), ' ORDER BY concurrency ASC, delay ASC');
    runs = fetch(conn, query);

    for row = 1:length(runs)
        id = runs{row, 1};
        x = find(X==runs{row, 3});
        y = find(Y==runs{row, 5});

        query = strcat('SELECT duration FROM results WHERE run_id=', int2str(id));
        results = cell2mat(fetch(conn, query));
        Z_mean(x, y) = mean(results);
        Z_deviation(x, y) = std(single(results));
    end
    
    protocol = 'HTTP/1.1';
    if (version == 2)
       protocol = 'HTTP/2';
    end
    
    figure;
    surf(X,Y,Z_mean);
    
    title(strcat(protocol, ': mean duration of requests'));
    xlabel('Concurrency');
    ylabel('Delay');
    zlabel('Mean duration');
    
    max_mean = max([max_mean, max(Z_mean)]);
    colorbar;
    caxis([0, max_mean]);
    colormap jet
    
    figure;
    surf(X,Y,Z_deviation);
    
    title(strcat(protocol, ': standard deviation of request duration'));
    xlabel('Concurrency');
    ylabel('Delay');
    zlabel('Standard deviation of duration');
    
    max_deviation = max([max_deviation, max(Z_deviation)]);
    colorbar;
    caxis([0, max_deviation]);
    colormap jet
end
