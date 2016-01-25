import os

with open('links.json', 'a') as f:
  f.write('{\n')
  count = 0
  for dirname, dirnames, filenames in os.walk('.'):

    # print path to all subdirectories first.
    # for subdirname in dirnames:
    #   print(os.path.join(dirname, subdirname))


    first = True
    for filename in filenames:

      if filename.lower().endswith('.gif'):
        if first: 
          first = False
          f.write('  "' + str(count) + '": "' + os.path.join('http://www.pkparaiso.com/imagenes/xy/sprites/animados/', filename) + '"')
          count += 1
        else:
          f.write(',\n  "' + str(count) + '": "' + os.path.join('http://www.pkparaiso.com/imagenes/xy/sprites/animados/', filename) + '"')
          count += 1
      

  f.write('\n}')