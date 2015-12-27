import os

with open('links.json', 'a') as f:
  f.write('{\n')
  count = 0
  for dirname, dirnames, filenames in os.walk('.'):

    # print path to all subdirectories first.
    # for subdirname in dirnames:
    #   print(os.path.join(dirname, subdirname))


    # print path to all filenames.
    for filename in filenames:
      if filename.lower().endswith('.gif'):
        f.write('\t"' + str(count) + '": "' + os.path.join('http://www.pkparaiso.com/imagenes/xy/sprites/animados/', filename) + '",\n')
        count += 1

  f.write('}')