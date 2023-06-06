const markdown = `---
title: Создание виртуальной машины Windows
description: Cоздайте виртуальную машину Windows в облаке с помощью сервиса {{ compute-short-name }}. Вы можете подключиться к виртуальной машине Windows используя Remote Dektop Protocol (RDP), встроенный в образ ОС. Перед подключением к виртуальной машине Windows убедитесь, что NLA включен в настройках вашего компьютера.

key: >
  Sammy Sosa

  Let's Goooo

seq:
  - windows
  - windows vm
  - windows вм
  - windows виртуальная машина
  - виртуальная машина
  - вм

seq_of_mappings:
  -
    name: Mark
    age: 13
  -
    name: Noam
    age: 99

# comment

object_inline: {name: John Smith, age: 33}
array_inline: [milk, pumpkin pie, eggs, juice]
seq_of_seq:
  - [Mark McGwire, 65, 0.278]
  - [Sammy Sosa  , 63, 0.288]
nesting:
  - { children: [{name: bob}, {name: marry}]}
---
# Мета

Комментарии и метаданные — это элементы разметки, которые не отображаются в собранном файле. Они используются, чтобы хранить в исходном тексте информацию для SEO или авторов документа.
`;

const skeleton = `---
title: '%%%1%%%'
description: '%%%2%%% %%%3%%% %%%4%%%'
key: |
      %%%5%%%
seq:
  - '%%%6%%%'
  - '%%%7%%%'
  - '%%%8%%%'
  - '%%%9%%%'
  - '%%%10%%%'
  - '%%%11%%%'
seq_of_mappings:
  - name: '%%%12%%%'
    age: 13
  - name: '%%%13%%%'
    age: 99
object_inline:
  name: '%%%14%%%'
  age: 33
array_inline:
  - '%%%15%%%'
  - '%%%16%%%'
  - '%%%17%%%'
  - '%%%18%%%'
seq_of_seq:
  - - '%%%19%%%'
    - 65
    - 0.278
  - - '%%%20%%%'
    - 63
    - 0.288
nesting:
  - children:
    - name: '%%%21%%%'
    - name: '%%%22%%%'
---
# %%%23%%%
%%%24%%% %%%25%%%
`;

const translations = new Map<string, string>([
    ['1', 'Creation of the Windows virtual machine'],
    ['2', 'Create Windows virtual machine with {{ compute-short-name }} service.'],
    ['3', 'You can connect to the virtual machine using Remote Desktop Protocol (RDP).'],
    ['4', 'Before connecting ensure that NLA is enabled.'],
    ['5', "Sammy Sosa\n\nLet's Goooo"],
    ['6', 'windows'],
    ['7', 'windows vm'],
    ['8', 'windows vm'],
    ['9', 'windows virtual machine'],
    ['10', 'virtual machine'],
    ['11', 'vm'],
    ['12', 'Mark'],
    ['13', 'Noam'],
    ['14', 'John Smith'],
    ['15', 'milk'],
    ['16', 'pumpkin pie'],
    ['17', 'eggs'],
    ['18', 'juice'],
    ['19', 'Mark McGwire'],
    ['20', 'Sammy Sosa'],
    ['21', 'bob'],
    ['22', 'marry'],
    ['23', 'Meta'],
    ['24', 'Comments and metadata - not displayed in the final file.'],
    ['25', 'They are used to make comments for other writers or set meta into final html for seo.'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
